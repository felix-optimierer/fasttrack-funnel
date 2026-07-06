import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index, boolean as mysqlBoolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
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
    /** Quelle des Leads, z.B. "home", "ki-report", "exit-plan", "traumwebseite" */
    source: varchar("source", { length: 64 }).default("home").notNull(),
    /** Status der Webhook-Weiterleitung: pending | sent | failed | none */
    webhookStatus: varchar("webhookStatus", { length: 32 }).default("pending").notNull(),

    // --- UTM-Parameter ---
    utmSource: varchar("utmSource", { length: 255 }),
    utmMedium: varchar("utmMedium", { length: 255 }),
    utmCampaign: varchar("utmCampaign", { length: 255 }),
    utmTerm: varchar("utmTerm", { length: 255 }),
    utmContent: varchar("utmContent", { length: 255 }),

    // --- Tracking-Metadaten ---
    referrer: varchar("referrer", { length: 2048 }),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    /** Verweildauer auf der Seite in Sekunden (vor Opt-In) */
    timeOnPageSeconds: int("timeOnPageSeconds"),

    // --- CRM-Felder ---
    /** CRM-Status: new | contacted | qualified | appointment | closed | lost */
    crmStatus: varchar("crmStatus", { length: 32 }).default("new").notNull(),
    /** Notizen (JSON-Array als String) */
    notes: text("notes"),

    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("leads_created_idx").on(t.createdAt),
    sourceIdx: index("leads_source_idx").on(t.source),
    crmStatusIdx: index("leads_crm_status_idx").on(t.crmStatus),
  }),
);

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Page-Views — Besucher-Tracking pro Seite.
 */
export const pageViews = mysqlTable(
  "page_views",
  {
    id: int("id").autoincrement().primaryKey(),
    page: varchar("page", { length: 32 }).notNull(),
    /** Anonyme Besucher-ID (localStorage), um Unique Visitors grob zu schätzen */
    visitorId: varchar("visitorId", { length: 64 }),

    // --- UTM-Parameter ---
    utmSource: varchar("utmSource", { length: 255 }),
    utmMedium: varchar("utmMedium", { length: 255 }),
    utmCampaign: varchar("utmCampaign", { length: 255 }),
    utmTerm: varchar("utmTerm", { length: 255 }),
    utmContent: varchar("utmContent", { length: 255 }),

    // --- Tracking-Metadaten ---
    referrer: varchar("referrer", { length: 2048 }),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),

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

/**
 * Termine (Appointments) — wenn jemand über Calendly bucht.
 */
export const appointments = mysqlTable(
  "appointments",
  {
    id: int("id").autoincrement().primaryKey(),
    source: varchar("source", { length: 64 }).notNull(),
    leadId: int("leadId"),
    eventUri: varchar("eventUri", { length: 512 }),
    name: varchar("name", { length: 255 }),
    email: varchar("email", { length: 320 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    sourceIdx: index("appt_source_idx").on(t.source),
    createdIdx: index("appt_created_idx").on(t.createdAt),
  }),
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Webhooks pro Kanal.
 */
export const webhooks = mysqlTable(
  "webhooks",
  {
    id: int("id").autoincrement().primaryKey(),
    channel: varchar("channel", { length: 64 }).notNull().unique(),
    url: text("url"),
    active: int("active").default(1).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    channelIdx: index("wh_channel_idx").on(t.channel),
  }),
);

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

/**
 * Ad-Spend pro Kanal und Tag — für CPL-Berechnung.
 */
export const adSpend = mysqlTable(
  "ad_spend",
  {
    id: int("id").autoincrement().primaryKey(),
    channel: varchar("channel", { length: 64 }).notNull(),
    date: varchar("date", { length: 10 }).notNull(),
    amountCents: int("amountCents").default(0).notNull(),
    /** Optional: Campaign-Name für Zuordnung */
    campaignName: varchar("campaignName", { length: 255 }),
    /** Optional: Notizen */
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    channelDateIdx: index("ads_channel_date_idx").on(t.channel, t.date),
  }),
);

export type AdSpend = typeof adSpend.$inferSelect;
export type InsertAdSpend = typeof adSpend.$inferInsert;
