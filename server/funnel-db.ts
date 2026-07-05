import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  InsertLead,
  InsertPageView,
  leads,
  pageViews,
  settings,
  appointments,
  webhooks,
  adSpend,
  type InsertAppointment,
} from "../drizzle/schema";

// ─── CHANNELS ──────────────────────────────────────────────────────────────────
export const CHANNELS = ["ki-report", "exit-plan", "traumwebseite"] as const;
export type Channel = (typeof CHANNELS)[number];

/** Mapping: welche Seiten gehören zu welchem Kanal (für PageView-Zuordnung) */
const CHANNEL_PAGES: Record<Channel, string[]> = {
  "ki-report": ["ki-report", "ki-report-termin"],
  "exit-plan": ["exit-plan", "exit-plan-termin"],
  "traumwebseite": ["traumwebseite", "webseite-termin"],
};

/** Mapping: welche Lead-Source gehört zu welchem Kanal */
const CHANNEL_SOURCES: Record<Channel, string[]> = {
  "ki-report": ["ki-report"],
  "exit-plan": ["exit-plan"],
  "traumwebseite": ["home", "traumwebseite"],
};

// ─── LEADS ─────────────────────────────────────────────────────────────────────

/** Lead anlegen und die neue ID zurückgeben. */
export async function insertLead(data: InsertLead): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(leads).values(data);
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

// ─── PAGE VIEWS ────────────────────────────────────────────────────────────────

/** Page-View erfassen. */
export async function insertPageView(data: InsertPageView) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values(data);
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

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

// ─── PERIOD HELPERS ────────────────────────────────────────────────────────────

export type Period = "day" | "week" | "month";

function periodStart(period: Period): Date {
  const now = new Date();
  const d = new Date(now);
  if (period === "day") {
    d.setHours(0, 0, 0, 0);
  } else if (period === "week") {
    const day = d.getDay() === 0 ? 7 : d.getDay();
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
  } else {
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
  }
  return d;
}

// ─── LEGACY STATS (kept for backwards compat) ──────────────────────────────────

/** Aggregierte Statistiken für das Dashboard (legacy). */
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

/** Zeitreihe (legacy) – letzte N Tage. */
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

// ─── PER-CHANNEL FUNNEL STATS ──────────────────────────────────────────────────

export interface ChannelFunnelStats {
  channel: Channel;
  visitors: number;
  leads: number;
  appointments: number;
  lpCr: number; // leads / visitors (0-1)
  terminCr: number; // appointments / leads (0-1)
  adSpendCents: number;
  cpl: number; // adSpend / leads (in cents, 0 if no leads)
}

/** Per-Channel Funnel-Statistiken für einen Zeitraum. */
export async function getFunnelStatsByChannel(period: Period): Promise<ChannelFunnelStats[]> {
  const db = await getDb();
  if (!db) return CHANNELS.map((ch) => ({ channel: ch, visitors: 0, leads: 0, appointments: 0, lpCr: 0, terminCr: 0, adSpendCents: 0, cpl: 0 }));

  const start = periodStart(period);

  // PageViews pro Seite
  const viewRows = await db
    .select({ page: pageViews.page, count: sql<number>`count(*)` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, start))
    .groupBy(pageViews.page);
  const viewMap: Record<string, number> = {};
  for (const r of viewRows) viewMap[r.page] = Number(r.count);

  // Leads pro Source
  const leadRows = await db
    .select({ source: leads.source, count: sql<number>`count(*)` })
    .from(leads)
    .where(gte(leads.createdAt, start))
    .groupBy(leads.source);
  const leadMap: Record<string, number> = {};
  for (const r of leadRows) leadMap[r.source] = Number(r.count);

  // Appointments pro Source
  const apptRows = await db
    .select({ source: appointments.source, count: sql<number>`count(*)` })
    .from(appointments)
    .where(gte(appointments.createdAt, start))
    .groupBy(appointments.source);
  const apptMap: Record<string, number> = {};
  for (const r of apptRows) apptMap[r.source] = Number(r.count);

  // AdSpend pro Channel (summiert)
  const spendRows = await db
    .select({ channel: adSpend.channel, total: sql<number>`SUM(${adSpend.amountCents})` })
    .from(adSpend)
    .where(gte(adSpend.createdAt, start))
    .groupBy(adSpend.channel);
  const spendMap: Record<string, number> = {};
  for (const r of spendRows) spendMap[r.channel] = Number(r.total ?? 0);

  return CHANNELS.map((ch) => {
    const visitors = CHANNEL_PAGES[ch].reduce((sum, p) => sum + (viewMap[p] ?? 0), 0);
    const channelLeads = CHANNEL_SOURCES[ch].reduce((sum, s) => sum + (leadMap[s] ?? 0), 0);
    const channelAppts = apptMap[ch] ?? 0;
    const channelSpend = spendMap[ch] ?? 0;
    const lpCr = visitors > 0 ? channelLeads / visitors : 0;
    const terminCr = channelLeads > 0 ? channelAppts / channelLeads : 0;
    const cpl = channelLeads > 0 ? Math.round(channelSpend / channelLeads) : 0;

    return {
      channel: ch,
      visitors,
      leads: channelLeads,
      appointments: channelAppts,
      lpCr,
      terminCr,
      adSpendCents: channelSpend,
      cpl,
    };
  });
}

// ─── PER-CHANNEL DAILY SERIES (für Charts) ─────────────────────────────────────

export interface ChannelDayPoint {
  day: string;
  channel: Channel;
  visitors: number;
  leads: number;
  appointments: number;
  adSpendCents: number;
}

/** Tägliche Zeitreihe pro Kanal für die letzten N Tage. */
export async function getChannelSeries(days: number): Promise<ChannelDayPoint[]> {
  const db = await getDb();
  if (!db) return [];

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);
  const startStr = start.toISOString().slice(0, 19).replace("T", " ");

  // PageViews pro Tag + Seite (use db.execute to avoid Drizzle groupBy+DATE bug)
  const pvResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, page, count(*) as count FROM page_views WHERE createdAt >= ${startStr} GROUP BY DATE(createdAt), page`
  );
  const pvRows = (pvResult as unknown as any[][])[0] ?? [];

  // Leads pro Tag + Source
  const leadResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, source, count(*) as count FROM leads WHERE createdAt >= ${startStr} GROUP BY DATE(createdAt), source`
  );
  const leadRows = (leadResult as unknown as any[][])[0] ?? [];

  // Appointments pro Tag + Source
  const apptResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, source, count(*) as count FROM appointments WHERE createdAt >= ${startStr} GROUP BY DATE(createdAt), source`
  );
  const apptRows = (apptResult as unknown as any[][])[0] ?? [];

  // AdSpend pro Tag + Channel
  const spendResult = await db.execute(
    sql`SELECT date as day, channel, SUM(amountCents) as total FROM ad_spend WHERE createdAt >= ${startStr} GROUP BY date, channel`
  );
  const spendRows = (spendResult as unknown as any[][])[0] ?? [];

  // Alle Tage im Bereich generieren
  const allDays: string[] = [];
  const d = new Date(start);
  const now = new Date();
  while (d <= now) {
    allDays.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }

  const result: ChannelDayPoint[] = [];

  for (const day of allDays) {
    for (const ch of CHANNELS) {
      // DATE() from mysql2 returns a Date object or string depending on driver mode
      const toDateStr = (v: any) => {
        if (!v) return "";
        if (v instanceof Date) return v.toISOString().slice(0, 10);
        return String(v).slice(0, 10);
      };

      const visitors = CHANNEL_PAGES[ch].reduce((sum, page) => {
        const found = pvRows.find((r) => toDateStr(r.day) === day && r.page === page);
        return sum + (found ? Number(found.count) : 0);
      }, 0);

      const channelLeads = CHANNEL_SOURCES[ch].reduce((sum, src) => {
        const found = leadRows.find((r) => toDateStr(r.day) === day && r.source === src);
        return sum + (found ? Number(found.count) : 0);
      }, 0);

      const apptFound = apptRows.find((r) => toDateStr(r.day) === day && r.source === ch);
      const channelAppts = apptFound ? Number(apptFound.count) : 0;

      const spendFound = spendRows.find((r) => toDateStr(r.day) === day && r.channel === ch);
      const channelSpend = spendFound ? Number(spendFound.total ?? 0) : 0;

      result.push({
        day,
        channel: ch,
        visitors,
        leads: channelLeads,
        appointments: channelAppts,
        adSpendCents: channelSpend,
      });
    }
  }

  return result;
}

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────

/** Termin anlegen (z.B. via Calendly-Webhook). */
export async function insertAppointment(data: InsertAppointment): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appointments).values(data);
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  return insertId ?? null;
}

// ─── PER-CHANNEL WEBHOOKS ──────────────────────────────────────────────────────

/** Webhook-URL für einen Kanal lesen. */
export async function getWebhookByChannel(channel: string): Promise<{ url: string; active: boolean } | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(webhooks).where(eq(webhooks.channel, channel)).limit(1);
  if (rows.length === 0) return null;
  return { url: rows[0].url ?? "", active: rows[0].active === 1 };
}

/** Alle Webhooks lesen. */
export async function getAllWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).orderBy(webhooks.channel);
}

/** Webhook-URL für einen Kanal setzen (upsert). */
export async function setWebhookByChannel(channel: string, url: string, active: boolean = true) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(webhooks)
    .values({ channel, url, active: active ? 1 : 0 })
    .onDuplicateKeyUpdate({ set: { url, active: active ? 1 : 0 } });
}

// ─── AD SPEND ──────────────────────────────────────────────────────────────────

/** Ad-Spend für einen Kanal und Tag setzen (upsert via unique channel+date). */
export async function setAdSpend(channel: string, date: string, amountCents: number) {
  const db = await getDb();
  if (!db) return;
  // Da kein unique constraint auf channel+date, erst prüfen ob existiert
  const existing = await db
    .select()
    .from(adSpend)
    .where(and(eq(adSpend.channel, channel), eq(adSpend.date, date)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adSpend)
      .set({ amountCents })
      .where(and(eq(adSpend.channel, channel), eq(adSpend.date, date)));
  } else {
    await db.insert(adSpend).values({ channel, date, amountCents });
  }
}

/** Ad-Spend für einen Kanal im Zeitraum lesen. */
export async function getAdSpendByChannel(channel: string, period: Period) {
  const db = await getDb();
  if (!db) return [];
  const start = periodStart(period);
  return db
    .select()
    .from(adSpend)
    .where(and(eq(adSpend.channel, channel), gte(adSpend.createdAt, start)))
    .orderBy(adSpend.date);
}

// ─── WEBHOOK FIRE (per channel) ────────────────────────────────────────────────

/** Webhook für einen bestimmten Kanal auslösen. */
export async function fireChannelWebhook(channel: string, payload: Record<string, unknown>): Promise<"sent" | "failed" | "none"> {
  const wh = await getWebhookByChannel(channel);
  if (!wh || !wh.url || !wh.active) {
    // Fallback: globale webhook_url aus Settings
    const globalUrl = await getSetting("webhook_url");
    if (!globalUrl) return "none";
    try {
      const res = await fetch(globalUrl, {
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
  try {
    const res = await fetch(wh.url, {
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

/** Legacy: Webhook auslösen über globale Settings-URL. */
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
