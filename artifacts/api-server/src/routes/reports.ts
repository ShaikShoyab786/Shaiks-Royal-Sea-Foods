import { Router, type IRouter } from "express";
import { sql, eq, ne } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { GetDailyReportQueryParams, GetDailyReportResponse, GetOrderSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /reports/daily (admin)
router.get("/reports/daily", requireAuth, requireRole("admin"), async (req, res): Promise<void> => {
  const queryParams = GetDailyReportQueryParams.safeParse(req.query);
  const date = (queryParams.success && queryParams.data.date) || new Date().toISOString().slice(0, 10);

  const [stats] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      deliveredOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'delivered')::int`,
      pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} not in ('delivered','cancelled'))::int`,
      cancelledOrders: sql<number>`count(*) filter (where ${ordersTable.status} = 'cancelled')::int`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.status} != 'cancelled'), 0)::float`,
      codRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.paymentMethod} = 'cod' and ${ordersTable.status} != 'cancelled'), 0)::float`,
      onlineRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.paymentMethod} = 'online' and ${ordersTable.status} != 'cancelled'), 0)::float`,
      totalDeliveryCharges: sql<number>`coalesce(sum(${ordersTable.deliveryCharge}) filter (where ${ordersTable.status} != 'cancelled'), 0)::float`,
      morningSlotOrders: sql<number>`count(*) filter (where ${ordersTable.timeslotId} = 1 and ${ordersTable.status} != 'cancelled')::int`,
      afternoonSlotOrders: sql<number>`count(*) filter (where ${ordersTable.timeslotId} = 2 and ${ordersTable.status} != 'cancelled')::int`,
    })
    .from(ordersTable)
    .where(sql`${ordersTable.deliveryDate} = ${date}`);

  // Top products for the day
  const topProducts = await db
    .select({
      productId: orderItemsTable.productId,
      productName: productsTable.name,
      totalKg: sql<number>`sum(${orderItemsTable.weightKg})::float`,
      totalRevenue: sql<number>`sum(${orderItemsTable.total})::float`,
    })
    .from(orderItemsTable)
    .innerJoin(ordersTable, eq(orderItemsTable.orderId, ordersTable.id))
    .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .where(sql`${ordersTable.deliveryDate} = ${date} AND ${ordersTable.status} != 'cancelled'`)
    .groupBy(orderItemsTable.productId, productsTable.name)
    .orderBy(sql`sum(${orderItemsTable.weightKg}) desc`)
    .limit(5);

  res.json(
    GetDailyReportResponse.parse({
      date,
      ...stats,
      topProducts,
    })
  );
});

// GET /reports/summary (admin)
router.get("/reports/summary", requireAuth, requireRole("admin"), async (_req, res): Promise<void> => {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [overall] = await db
    .select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.status} != 'cancelled'), 0)::float`,
      pendingOrders: sql<number>`count(*) filter (where ${ordersTable.status} not in ('delivered','cancelled'))::int`,
    })
    .from(ordersTable);

  const [customerCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usersTable)
    .where(eq(usersTable.role, "customer"));

  const [todayStats] = await db
    .select({
      todayOrders: sql<number>`count(*)::int`,
      todayRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.status} != 'cancelled'), 0)::float`,
    })
    .from(ordersTable)
    .where(sql`${ordersTable.deliveryDate} = ${today}`);

  const [weekStats] = await db
    .select({
      weekOrders: sql<number>`count(*)::int`,
      weekRevenue: sql<number>`coalesce(sum(${ordersTable.total}) filter (where ${ordersTable.status} != 'cancelled'), 0)::float`,
    })
    .from(ordersTable)
    .where(sql`${ordersTable.deliveryDate} >= ${weekAgo}`);

  res.json(
    GetOrderSummaryResponse.parse({
      totalOrders: overall?.totalOrders ?? 0,
      totalRevenue: overall?.totalRevenue ?? 0,
      totalCustomers: customerCount?.count ?? 0,
      pendingOrders: overall?.pendingOrders ?? 0,
      todayOrders: todayStats?.todayOrders ?? 0,
      todayRevenue: todayStats?.todayRevenue ?? 0,
      weekOrders: weekStats?.weekOrders ?? 0,
      weekRevenue: weekStats?.weekRevenue ?? 0,
    })
  );
});

export default router;
