import { pgTable, text, serial, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin", "executive"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").unique(),
  name: text("name").notNull().default(""),
  role: userRoleEnum("role").notNull().default("customer"),
  passwordHash: text("password_hash"),
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
