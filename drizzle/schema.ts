import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Leads — jeder Opt-In aus dem Funnel landet hier.
 */
export const leads = mysqlTable(
  "leads",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    phone: varchar("phone", { length: 64 }).notNull(),
    /** Quelle des Leads, z.B. "home" */
    source: varchar("source", { length: 64 }).default("home").notNull(),
    /** Status der Webhook-Weiterleitung: pending | sent | failed | none */
    webhookStatus: varchar("webhookStatus", { length: 32 }).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("leads_created_idx").on(t.createdAt),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Page-Views — Besucher-Tracking pro Seite (home | vsl | termin).
 */
export const pageViews = mysqlTable(
  "page_views",
  {
    id: int("id").autoincrement().primaryKey(),
    page: varchar("page", { length: 32 }).notNull(),
    /** Anonyme Besucher-ID (localStorage), um Unique Visitors grob zu schätzen */
    visitorId: varchar("visitorId", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    pageIdx: index("pv_page_idx").on(t.page),
    createdIdx: index("pv_created_idx").on(t.createdAt),
  }),
);

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * App-Settings (key/value) — u.a. die konfigurierbare Webhook-URL.
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
