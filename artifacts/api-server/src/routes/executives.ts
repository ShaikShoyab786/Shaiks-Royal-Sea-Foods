import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, usersTable, ordersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  ListExecutivesResponse,
  CreateExecutiveBody,
  CreateExecutiveResponse,
  DeleteExecutiveParams,
  ListDeliveriesForExecutiveParams,
  ListDeliveriesForExecutiveResponse,
  GetMyDeliveriesQueryParams,
  GetMyDeliveriesResponse,
} from "@workspace/api-zod";
import { buildOrderResponse } from "./orderUtils";

const router: IRouter = Router();

async function getExecutiveSummary(executiveId: number) {
  const today = new Date().toISOString().slice(0, 10);

  const [deliveriesRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(
      sql`${ordersTable.executiveId} = ${executiveId} AND ${ordersTable.deliveryDate} = ${today} AND ${ordersTable.status} != 'cancelled'`
    );

  const [cashRow] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.total}), 0)::float` })
    .from(ordersTable)
    .where(
      sql`${ordersTable.executiveId} = ${executiveId} AND ${ordersTable.deliveryDate} = ${today} AND ${ordersTable.paymentMethod} = 'cod' AND ${ordersTable.cashCollected} = true`
    );

  const [fuelRow] = await db
    .select({ total: sql<number>`coalesce(sum(${ordersTable.deliveryCharge}), 0)::float` })
    .from(ordersTable)
    .where(
      sql`${ordersTable.executiveId} = ${executiveId} AND ${ordersTable.deliveryDate} = ${today} AND ${ordersTable.status} != 'cancelled'`
    );

  return {
    todayDeliveries: deliveriesRow?.count ?? 0,
    todayCashCollected: cashRow?.total ?? 0,
    todayFuelEarned: fuelRow?.total ?? 0,
  };
}

// GET /executives (admin)
router.get("/executives", requireAuth, requireRole("admin"), async (_req, res): Promise<void> => {
  const execs = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "executive"))
    .orderBy(usersTable.name);

  const result = await Promise.all(
    execs.map(async (e) => {
      const summary = await getExecutiveSummary(e.id);
      return {
        id: e.id,
        name: e.name,
        phone: e.phone ?? "",
        isActive: e.isActive === "true",
        createdAt: e.createdAt.toISOString(),
        ...summary,
      };
    })
  );

  res.json(ListExecutivesResponse.parse(result));
});

// POST /executives (admin)
router.post("/executives", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const parsed = CreateExecutiveBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check if user with this phone exists
  let [user] = await db.select().from(usersTable).where(eq(usersTable.phone, parsed.data.phone)).limit(1);
  if (user) {
    // Promote to executive
    [user] = await db
      .update(usersTable)
      .set({ role: "executive", name: parsed.data.name })
      .where(eq(usersTable.phone, parsed.data.phone))
      .returning();
  } else {
    [user] = await db
      .insert(usersTable)
      .values({ phone: parsed.data.phone, name: parsed.data.name, role: "executive" })
      .returning();
  }

  const summary = await getExecutiveSummary(user.id);
  res.status(201).json(
    CreateExecutiveResponse.parse({
      id: user.id,
      name: user.name,
      phone: user.phone ?? "",
      isActive: user.isActive === "true",
      createdAt: user.createdAt.toISOString(),
      ...summary,
    })
  );
});

// DELETE /executives/:id (admin)
router.delete("/executives/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = DeleteExecutiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  // Demote to customer instead of hard delete
  const [user] = await db
    .update(usersTable)
    .set({ role: "customer" })
    .where(eq(usersTable.id, params.data.id))
    .returning();
  if (!user) {
    res.status(404).json({ error: "Executive not found" });
    return;
  }
  res.sendStatus(204);
});

// GET /executives/me/deliveries (executive)
router.get("/executives/me/deliveries", requireAuth, requireRole("executive"), async (req, res): Promise<void> => {
  const queryParams = GetMyDeliveriesQueryParams.safeParse(req.query);
  const date = (queryParams.success && queryParams.data.date) || new Date().toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(ordersTable)
    .where(sql`${ordersTable.executiveId} = ${req.user!.userId} AND ${ordersTable.deliveryDate} = ${date}`)
    .orderBy(ordersTable.id);

  const orders = await Promise.all(rows.map((r) => buildOrderResponse(r.id)));
  res.json(GetMyDeliveriesResponse.parse(orders.filter(Boolean)));
});

// GET /executives/:id/deliveries (admin)
router.get("/executives/:id/deliveries", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = ListDeliveriesForExecutiveParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const today = new Date().toISOString().slice(0, 10);

  const rows = await db
    .select()
    .from(ordersTable)
    .where(sql`${ordersTable.executiveId} = ${params.data.id} AND ${ordersTable.deliveryDate} = ${today}`)
    .orderBy(ordersTable.id);

  const orders = await Promise.all(rows.map((r) => buildOrderResponse(r.id)));
  res.json(ListDeliveriesForExecutiveResponse.parse(orders.filter(Boolean)));
});

export default router;
