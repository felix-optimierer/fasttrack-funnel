import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, index, boolean as mysqlBoolean, decimal } from "drizzle-orm/mysql-core";

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
    /** Facebook Click ID */
    fbclid: varchar("fbclid", { length: 512 }),
    /** Seiten-URL bei Opt-In */
    pageUrl: varchar("pageUrl", { length: 2048 }),
    /** Gerät (Desktop/Mobile/Tablet) */
    device: varchar("device", { length: 32 }),
    /** Browser-Name */
    browser: varchar("browser", { length: 128 }),
    /** Verweildauer auf der Seite in Sekunden (vor Opt-In) */
    timeOnPageSeconds: int("timeOnPageSeconds"),

    // --- CRM-Felder ---
    /** CRM-Status: new | contacted | qualified | appointment | closed | lost */
    crmStatus: varchar("crmStatus", { length: 32 }).default("new").notNull(),
    /** Notizen (JSON-Array als String) */
    notes: text("notes"),

    /** Duplikat-Markierung: true wenn gleiche E-Mail innerhalb 2 Min erneut eingetragen */
    isDuplicate: mysqlBoolean("isDuplicate").default(false).notNull(),

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

// ═══════════════════════════════════════════════════════════════════════════════
// TESTOPTIMIERER – A/B Testing System
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * AB-Projekte — jede Landing Page / Funnel-Seite, die optimiert wird.
 */
export const abProjects = mysqlTable(
  "ab_projects",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    targetUrl: varchar("targetUrl", { length: 500 }).notNull(),
    conversionUrlPattern: varchar("conversionUrlPattern", { length: 500 }).notNull(),
    conversionMatchType: mysqlEnum("conversionMatchType", ["exact", "contains"]).default("contains").notNull(),
    status: mysqlEnum("status", ["active", "paused", "stopped"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    statusIdx: index("ab_proj_status_idx").on(t.status),
  }),
);

export type AbProject = typeof abProjects.$inferSelect;
export type InsertAbProject = typeof abProjects.$inferInsert;

/**
 * AB-Elemente — testbare Elemente auf einer Seite (Headline, Sub-Headline, CTA).
 */
export const abElements = mysqlTable(
  "ab_elements",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    elementType: mysqlEnum("elementType", ["main_headline", "pre_headline", "sub_headline", "cta"]).notNull(),
    cssSelector: varchar("cssSelector", { length: 1000 }).notNull(),
    originalText: text("originalText").notNull(),
    label: varchar("label", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    projectIdx: index("ab_elem_project_idx").on(t.projectId),
  }),
);

export type AbElement = typeof abElements.$inferSelect;
export type InsertAbElement = typeof abElements.$inferInsert;

/**
 * AB-Tests — jeder einzelne A/B-Test (ein Element, zwei Varianten).
 */
export const abTests = mysqlTable(
  "ab_tests",
  {
    id: int("id").autoincrement().primaryKey(),
    projectId: int("projectId").notNull(),
    elementId: int("elementId").notNull(),
    variantText: text("variantText").notNull(),
    controlText: text("controlText").notNull(),
    trafficSplit: int("trafficSplit").default(50).notNull(),
    status: mysqlEnum("status", ["running", "paused", "winner_a", "winner_b", "no_result", "stopped", "skipped"]).default("running").notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    endedAt: timestamp("endedAt"),
    visitorsA: int("visitorsA").default(0).notNull(),
    visitorsB: int("visitorsB").default(0).notNull(),
    conversionsA: int("conversionsA").default(0).notNull(),
    conversionsB: int("conversionsB").default(0).notNull(),
    significanceLevel: decimal("significanceLevel", { precision: 8, scale: 6 }),
    improvementPercent: decimal("improvementPercent", { precision: 8, scale: 2 }),
  },
  (t) => ({
    projectIdx: index("ab_test_project_idx").on(t.projectId),
    elementIdx: index("ab_test_element_idx").on(t.elementId),
    statusIdx: index("ab_test_status_idx").on(t.status),
  }),
);

export type AbTest = typeof abTests.$inferSelect;
export type InsertAbTest = typeof abTests.$inferInsert;

/**
 * AB-Besucher — Tracking welcher Besucher welche Variante sieht.
 */
export const abVisitors = mysqlTable(
  "ab_visitors",
  {
    id: int("id").autoincrement().primaryKey(),
    testId: int("testId").notNull(),
    visitorUid: varchar("visitorUid", { length: 64 }).notNull(),
    variant: mysqlEnum("variant", ["a", "b"]).notNull(),
    converted: mysqlBoolean("converted").default(false).notNull(),
    firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
    convertedAt: timestamp("convertedAt"),
  },
  (t) => ({
    testIdx: index("ab_vis_test_idx").on(t.testId),
    visitorIdx: index("ab_vis_visitor_idx").on(t.visitorUid, t.testId),
  }),
);

export type AbVisitor = typeof abVisitors.$inferSelect;
export type InsertAbVisitor = typeof abVisitors.$inferInsert;

/**
 * AB-Benachrichtigungslog — Protokoll aller gesendeten Benachrichtigungen.
 */
export const abNotificationsLog = mysqlTable(
  "ab_notifications_log",
  {
    id: int("id").autoincrement().primaryKey(),
    testId: int("testId").notNull(),
    type: mysqlEnum("type", ["winner_found", "no_significance", "test_started"]).notNull(),
    sentAt: timestamp("sentAt").defaultNow().notNull(),
    message: text("message"),
  },
  (t) => ({
    testIdx: index("ab_notif_test_idx").on(t.testId),
  }),
);

export type AbNotificationLog = typeof abNotificationsLog.$inferSelect;
export type InsertAbNotificationLog = typeof abNotificationsLog.$inferInsert;

/**
 * AB-Einstellungen — konfigurierbare Schwellenwerte für Signifikanz.
 */
export const abSettings = mysqlTable("ab_settings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 128 }).notNull().unique(),
  settingValue: text("settingValue"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbSetting = typeof abSettings.$inferSelect;
export type InsertAbSetting = typeof abSettings.$inferInsert;
