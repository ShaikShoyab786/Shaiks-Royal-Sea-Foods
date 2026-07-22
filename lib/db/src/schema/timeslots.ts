import { pgTable, serial, integer, text, boolean } from "drizzle-orm/pg-core";

export const timeslotsTable = pgTable("timeslots", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  startHour: integer("start_hour").notNull(),
  endHour: integer("end_hour").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  maxOrders: integer("max_orders").notNull().default(50),
});

export type Timeslot = typeof timeslotsTable.$inferSelect;
