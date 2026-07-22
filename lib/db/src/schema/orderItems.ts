import { pgTable, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { ordersTable } from "./orders";
import { productsTable } from "./products";

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  weightKg: real("weight_kg").notNull(),
  pricePerKg: real("price_per_kg").notNull(),
  total: real("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderItem = typeof orderItemsTable.$inferSelect;
