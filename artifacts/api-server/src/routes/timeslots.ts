import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, timeslotsTable, ordersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import {
  ListTimeslotsResponse,
  UpdateTimeslotParams,
  UpdateTimeslotBody,
  UpdateTimeslotResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// GET /timeslots
router.get("/timeslots", async (_req, res): Promise<void> => {
  const slots = await db.select().from(timeslotsTable).orderBy(timeslotsTable.startHour);

  // Get today's order counts per slot
  const today = new Date().toISOString().slice(0, 10);
  const counts = await db
    .select({
      timeslotId: ordersTable.timeslotId,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .where(sql`${ordersTable.deliveryDate} = ${today} AND ${ordersTable.status} != 'cancelled'`)
    .groupBy(ordersTable.timeslotId);

  const countMap = new Map(counts.map((c) => [c.timeslotId, c.count]));

  res.json(
    ListTimeslotsResponse.parse(
      slots.map((s) => ({
        ...s,
        currentOrders: countMap.get(s.id) ?? 0,
      }))
    )
  );
});

// PATCH /timeslots/:id (admin)
router.patch("/timeslots/:id", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = UpdateTimeslotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTimeslotBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [slot] = await db
    .update(timeslotsTable)
    .set(parsed.data)
    .where(eq(timeslotsTable.id, params.data.id))
    .returning();
  if (!slot) {
    res.status(404).json({ error: "Time slot not found" });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(ordersTable)
    .where(
      sql`${ordersTable.timeslotId} = ${slot.id} AND ${ordersTable.deliveryDate} = ${today} AND ${ordersTable.status} != 'cancelled'`
    );

  res.json(
    UpdateTimeslotResponse.parse({
      ...slot,
      currentOrders: countRow?.count ?? 0,
    })
  );
});

export default router;
