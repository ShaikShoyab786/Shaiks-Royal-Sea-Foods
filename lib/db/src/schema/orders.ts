import { pgTable, serial, integer, text, boolean, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { timeslotsTable } from "./timeslots";

export const orderStatusEnum = pgEnum("order_status", ["pending", "confirmed", "assigned", "out_for_delivery", "delivered", "cancelled"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cod", "online"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid"]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => usersTable.id),
  executiveId: integer("executive_id").references(() => usersTable.id),
  timeslotId: integer("timeslot_id").notNull().references(() => timeslotsTable.id),
  deliveryDate: text("delivery_date").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  distanceKm: real("distance_km").notNull().default(0),
  deliveryCharge: real("delivery_charge").notNull().default(0),
  subtotal: real("subtotal").notNull(),
  total: real("total").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  status: orderStatusEnum("status").notNull().default("pending"),
  cashCollected: boolean("cash_collected").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Order = typeof ordersTable.$inferSelect;
