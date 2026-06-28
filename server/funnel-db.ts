import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  InsertLead,
  InsertPageView,
  leads,
  pageViews,
  settings,
} from "../drizzle/schema";

/** Lead anlegen und die neue ID zurückgeben. */
export async function insertLead(data: InsertLead): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
  // drizzle/mysql2 liefert insertId im ResultSetHeader
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  return insertId ?? null;
}

export async function updateLeadWebhookStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set({ webhookStatus: status }).where(eq(leads.id, id));
}

export async function listLeads() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

/** Page-View erfassen. */
export async function insertPageView(data: InsertPageView) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values(data);
}

/** Setting lesen. */
export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.settingKey, key))
    .limit(1);
  return rows.length > 0 ? (rows[0].settingValue ?? null) : null;
}

/** Setting schreiben (upsert). */
export async function setSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(settings)
    .values({ settingKey: key, settingValue: value })
    .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

export type Period = "day" | "week" | "month";

function periodStart(period: Period): Date {
  const now = new Date();
  const d = new Date(now);
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = d.getDay() === 0 ? 7 : d.getDay(); // Montag als Wochenstart
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

/** Aggregierte Statistiken für das Dashboard. */
export async function getStats(period: Period) {
  const db = await getDb();
  if (!db) {
    return {
      views: { home: 0, vsl: 0, termin: 0 },
      leads: 0,
      totalLeads: 0,
    };
  }

  const start = periodStart(period);

  const viewRows = await db
    .select({
      page: pageViews.page,
      count: sql<number>`count(*)`,
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, start))
    .groupBy(pageViews.page);

  const views: Record<string, number> = { home: 0, vsl: 0, termin: 0 };
  for (const r of viewRows) {
    views[r.page] = Number(r.count);
  }

  const leadRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(gte(leads.createdAt, start));
  const leadsInPeriod = Number(leadRows[0]?.count ?? 0);

  const totalLeadRows = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads);
  const totalLeads = Number(totalLeadRows[0]?.count ?? 0);

  return {
    views: {
      home: views.home ?? 0,
      vsl: views.vsl ?? 0,
      termin: views.termin ?? 0,
    },
    leads: leadsInPeriod,
    totalLeads,
  };
}

/** Zeitreihe (für einfache Verlaufsanzeige) – letzte N Tage. */
export async function getDailySeries(days: number) {
  const db = await getDb();
  if (!db) return [];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      day: sql<string>`DATE(${pageViews.createdAt})`,
      page: pageViews.page,
      count: sql<number>`count(*)`,
    })
    .from(pageViews)
    .where(gte(pageViews.createdAt, start))
    .groupBy(sql`DATE(${pageViews.createdAt})`, pageViews.page);

  return rows.map((r) => ({
    day: r.day,
    page: r.page,
    count: Number(r.count),
  }));
}

/** Webhook auslösen: alle Lead-Daten an die konfigurierte URL senden. */
export async function fireWebhook(payload: Record<string, unknown>): Promise<"sent" | "failed" | "none"> {
  const url = await getSetting("webhook_url");
  if (!url) return "none";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok ? "sent" : "failed";
  } catch (e) {
    console.error("[Webhook] Versand fehlgeschlagen:", e);
    return "failed";
  }
}
