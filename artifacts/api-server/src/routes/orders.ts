import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { haversineKm, calcDeliveryCharge, HUB_LAT, HUB_LNG } from "../lib/delivery";
import {
  ListOrdersQueryParams,
  ListOrdersResponse,
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderParams,
  GetOrderResponse,
  AssignOrderParams,
  AssignOrderBody,
  AssignOrderResponse,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusResponse,
  CancelOrderParams,
  CancelOrderResponse,
  MarkCashCollectedParams,
  MarkCashCollectedResponse,
} from "@workspace/api-zod";
import { buildOrderResponse } from "./orderUtils";

const router: IRouter = Router();

// GET /orders
router.get("/orders", requireAuth, async (req, res): Promise<void> => {
  const queryParams = ListOrdersQueryParams.safeParse(req.query);
  const filters: any[] = [];

  if (req.user!.role === "customer") {
    filters.push(eq(ordersTable.customerId, req.user!.userId));
  }

  if (queryParams.success) {
    if (queryParams.data.status) {
      filters.push(sql`${ordersTable.status} = ${queryParams.data.status}`);
    }
    if (queryParams.data.date) {
      const dateStr = queryParams.data.date instanceof Date
        ? queryParams.data.date.toISOString().slice(0, 10)
        : String(queryParams.data.date);
      filters.push(sql`${ordersTable.deliveryDate} = ${dateStr}`);
    }
    if (queryParams.data.executiveId) {
      filters.push(eq(ordersTable.executiveId, queryParams.data.executiveId));
    }
  }

  const rows = await db
    .select()
    .from(ordersTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(sql`${ordersTable.createdAt} desc`);

  const orders = await Promise.all(rows.map((r) => buildOrderResponse(r.id)));
  res.json(ListOrdersResponse.parse(orders.filter(Boolean)));
});

// POST /orders
router.post("/orders", requireAuth, requireRole("customer"), async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { timeslotId, deliveryAddress, latitude, longitude, paymentMethod, notes, items } = parsed.data;
  // Orval coerces format:date to Date object; convert back to YYYY-MM-DD string for DB
  const deliveryDate = parsed.data.deliveryDate instanceof Date
    ? parsed.data.deliveryDate.toISOString().slice(0, 10)
    : String(parsed.data.deliveryDate);

  // Calculate delivery distance and charge
  const distanceKm = haversineKm(HUB_LAT, HUB_LNG, latitude, longitude);
  const deliveryCharge = calcDeliveryCharge(distanceKm);

  // Calculate subtotal from products
  let subtotal = 0;
  const itemsWithPrices = await Promise.all(
    items.map(async (item) => {
      const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId)).limit(1);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      const total = item.weightKg * product.pricePerKg;
      subtotal += total;
      return { productId: item.productId, weightKg: item.weightKg, pricePerKg: product.pricePerKg, total };
    })
  );

  const total = subtotal + deliveryCharge;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerId: req.user!.userId,
      timeslotId,
      deliveryDate,
      deliveryAddress,
      latitude,
      longitude,
      distanceKm,
      deliveryCharge,
      subtotal,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "online" ? "paid" : "pending",
      status: "pending",
      notes: notes ?? null,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    itemsWithPrices.map((item) => ({ orderId: order.id, ...item }))
  );

  const orderData = await buildOrderResponse(order.id);
  res.status(201).json(CreateOrderResponse.parse(orderData));
});

// GET /orders/:id
router.get("/orders/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const order = await buildOrderResponse(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (req.user!.role === "customer" && order.customerId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.json(GetOrderResponse.parse(order));
});

// PATCH /orders/:id/assign (admin)
router.patch("/orders/:id/assign", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const params = AssignOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AssignOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .update(ordersTable)
    .set({ executiveId: parsed.data.executiveId, status: "assigned" })
    .where(eq(ordersTable.id, params.data.id));

  const order = await buildOrderResponse(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(AssignOrderResponse.parse(order));
});

// PATCH /orders/:id/status
router.patch("/orders/:id/status", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const paymentStatus = parsed.data.status === "delivered" ? "paid" : undefined;
  await db
    .update(ordersTable)
    .set({ status: parsed.data.status, ...(paymentStatus ? { paymentStatus } : {}) })
    .where(eq(ordersTable.id, params.data.id));

  const order = await buildOrderResponse(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(UpdateOrderStatusResponse.parse(order));
});

// PATCH /orders/:id/cancel
router.patch("/orders/:id/cancel", requireAuth, async (req, res): Promise<void> => {
  const params = CancelOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.update(ordersTable).set({ status: "cancelled" }).where(eq(ordersTable.id, params.data.id));
  const order = await buildOrderResponse(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(CancelOrderResponse.parse(order));
});

// PATCH /orders/:id/cash-collected (executive)
router.patch("/orders/:id/cash-collected", requireAuth, requireRole("executive"), async (req, res): Promise<void> => {
  const params = MarkCashCollectedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .update(ordersTable)
    .set({ cashCollected: true, paymentStatus: "paid" })
    .where(eq(ordersTable.id, params.data.id));

  const order = await buildOrderResponse(params.data.id);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.json(MarkCashCollectedResponse.parse(order));
});

export default router;
