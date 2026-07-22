import { eq } from "drizzle-orm";
import { db, ordersTable, orderItemsTable, productsTable, usersTable, timeslotsTable } from "@workspace/db";

export async function buildOrderResponse(orderId: number) {
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) return null;

  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, order.customerId)).limit(1);
  const [slot] = await db.select().from(timeslotsTable).where(eq(timeslotsTable.id, order.timeslotId)).limit(1);

  let executiveName: string | null = null;
  if (order.executiveId) {
    const [exec] = await db.select().from(usersTable).where(eq(usersTable.id, order.executiveId)).limit(1);
    executiveName = exec?.name ?? null;
  }

  const items = await db
    .select({
      id: orderItemsTable.id,
      productId: orderItemsTable.productId,
      productName: productsTable.name,
      weightKg: orderItemsTable.weightKg,
      pricePerKg: orderItemsTable.pricePerKg,
      total: orderItemsTable.total,
    })
    .from(orderItemsTable)
    .innerJoin(productsTable, eq(orderItemsTable.productId, productsTable.id))
    .where(eq(orderItemsTable.orderId, orderId));

  return {
    id: order.id,
    customerId: order.customerId,
    customerName: customer?.name ?? "",
    customerPhone: customer?.phone ?? "",
    timeslotId: order.timeslotId,
    timeslotLabel: slot?.label ?? "",
    deliveryDate: order.deliveryDate,
    deliveryAddress: order.deliveryAddress,
    latitude: order.latitude,
    longitude: order.longitude,
    distanceKm: order.distanceKm,
    deliveryCharge: order.deliveryCharge,
    subtotal: order.subtotal,
    total: order.total,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    status: order.status,
    executiveId: order.executiveId ?? null,
    executiveName,
    cashCollected: order.cashCollected,
    notes: order.notes ?? null,
    items,
    createdAt: order.createdAt.toISOString(),
  };
}
