import { and, desc, eq, gte, lte, inArray, like, sql } from "drizzle-orm";
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

const CHANNEL_PAGES: Record<Channel, string[]> = {
  "ki-report": ["ki-report", "ki-report-termin"],
  "exit-plan": ["exit-plan", "exit-plan-termin"],
  "traumwebseite": ["traumwebseite", "webseite-termin"],
};

const CHANNEL_SOURCES: Record<Channel, string[]> = {
  "ki-report": ["ki-report"],
  "exit-plan": ["exit-plan"],
  "traumwebseite": ["home", "traumwebseite"],
};

// ─── LEADS ─────────────────────────────────────────────────────────────────────

/**
 * Check if a lead with the same email was created within the last 2 minutes.
 * If so, mark the new lead as a duplicate.
 */
export async function checkDuplicate(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
  const existing = await db
    .select({ id: leads.id })
    .from(leads)
    .where(and(eq(leads.email, email), gte(leads.createdAt, twoMinAgo)))
    .limit(1);
  return existing.length > 0;
}

/**
 * Mark a lead as duplicate.
 */
export async function markLeadAsDuplicate(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set({ isDuplicate: true }).where(eq(leads.id, id));
}

/**
 * Delete a single lead by ID.
 */
export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leads).where(eq(leads.id, id));
}

/**
 * Delete multiple leads by IDs.
 */
export async function deleteLeadsBulk(ids: number[]) {
  const db = await getDb();
  if (!db || ids.length === 0) return;
  await db.delete(leads).where(inArray(leads.id, ids));
}

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

/** Einzelnen Lead mit allen Feldern laden. */
export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return rows[0] ?? null;
}

/** CRM-Status eines Leads aktualisieren. */
export async function updateLeadCrmStatus(id: number, crmStatus: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set({ crmStatus }).where(eq(leads.id, id));
}

/** Notizen eines Leads aktualisieren. */
export async function updateLeadNotes(id: number, notes: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set({ notes }).where(eq(leads.id, id));
}

/** Leads mit optionaler Suche, Filter und Pagination. */
export async function listLeadsEnhanced(opts: {
  search?: string;
  source?: string;
  crmStatus?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { leads: [], total: 0 };

  const conditions = [];
  if (opts.source) conditions.push(eq(leads.source, opts.source));
  if (opts.crmStatus) conditions.push(eq(leads.crmStatus, opts.crmStatus));
  if (opts.utmSource) conditions.push(eq(leads.utmSource, opts.utmSource));
  if (opts.utmMedium) conditions.push(eq(leads.utmMedium, opts.utmMedium));
  if (opts.utmCampaign) conditions.push(eq(leads.utmCampaign, opts.utmCampaign));
  if (opts.search) {
    const s = `%${opts.search}%`;
    conditions.push(
      sql`(${leads.name} LIKE ${s} OR ${leads.email} LIKE ${s} OR ${leads.phone} LIKE ${s})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;

  const [rows, countRows] = await Promise.all([
    where
      ? db.select().from(leads).where(where).orderBy(desc(leads.createdAt)).limit(limit).offset(offset)
      : db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset),
    where
      ? db.select({ count: sql<number>`count(*)` }).from(leads).where(where)
      : db.select({ count: sql<number>`count(*)` }).from(leads),
  ]);

  return {
    leads: rows,
    total: Number(countRows[0]?.count ?? 0),
  };
}

/** UTM-Aggregation für Pivot-Tabelle. */
export async function getUtmPivot(periodOrRange: Period | { startDate: string; endDate: string }) {
  const db = await getDb();
  if (!db) return [];

  let start: Date;
  let endDate: Date | null = null;
  if (typeof periodOrRange === "string") {
    start = periodStart(periodOrRange);
  } else {
    const range = dateRangeToStartEnd(periodOrRange.startDate, periodOrRange.endDate);
    start = range.start;
    endDate = range.end;
  }

  const conditions = endDate
    ? and(gte(leads.createdAt, start), lte(leads.createdAt, endDate))
    : gte(leads.createdAt, start);

  const rows = await db
    .select({
      utmSource: leads.utmSource,
      utmMedium: leads.utmMedium,
      utmCampaign: leads.utmCampaign,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .where(conditions)
    .groupBy(leads.utmSource, leads.utmMedium, leads.utmCampaign);

  return rows.map((r) => ({
    utmSource: r.utmSource ?? "(direkt)",
    utmMedium: r.utmMedium ?? "(none)",
    utmCampaign: r.utmCampaign ?? "(none)",
    count: Number(r.count),
  }));
}

/** Distinct UTM-Werte für Filter-Dropdowns. */
export async function getDistinctUtmValues() {
  const db = await getDb();
  if (!db) return { sources: [], mediums: [], campaigns: [] };

  const [srcRows, medRows, campRows] = await Promise.all([
    db.selectDistinct({ val: leads.utmSource }).from(leads).where(sql`${leads.utmSource} IS NOT NULL`),
    db.selectDistinct({ val: leads.utmMedium }).from(leads).where(sql`${leads.utmMedium} IS NOT NULL`),
    db.selectDistinct({ val: leads.utmCampaign }).from(leads).where(sql`${leads.utmCampaign} IS NOT NULL`),
  ]);

  return {
    sources: srcRows.map((r) => r.val).filter(Boolean) as string[],
    mediums: medRows.map((r) => r.val).filter(Boolean) as string[],
    campaigns: campRows.map((r) => r.val).filter(Boolean) as string[],
  };
}

// ─── PAGE VIEWS ────────────────────────────────────────────────────────────────

export async function insertPageView(data: InsertPageView) {
  const db = await getDb();
  if (!db) return;
  await db.insert(pageViews).values(data);
}

// ─── SETTINGS ──────────────────────────────────────────────────────────────────

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(settings).where(eq(settings.settingKey, key)).limit(1);
  return rows.length > 0 ? (rows[0].settingValue ?? null) : null;
}

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

/** Convert startDate/endDate strings (YYYY-MM-DD) to Date range */
export function dateRangeToStartEnd(startDate: string, endDate: string): { start: Date; end: Date } {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T23:59:59");
  return { start, end };
}

// ─── LEGACY STATS ──────────────────────────────────────────────────────────────

export async function getStats(period: Period) {
  const db = await getDb();
  if (!db) return { views: { home: 0, vsl: 0, termin: 0 }, leads: 0, totalLeads: 0 };

  const start = periodStart(period);

  const viewRows = await db
    .select({ page: pageViews.page, count: sql<number>`count(*)` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, start))
    .groupBy(pageViews.page);

  const views: Record<string, number> = { home: 0, vsl: 0, termin: 0 };
  for (const r of viewRows) views[r.page] = Number(r.count);

  const leadRows = await db.select({ count: sql<number>`count(*)` }).from(leads).where(and(gte(leads.createdAt, start), eq(leads.isDuplicate, false)));
  const leadsInPeriod = Number(leadRows[0]?.count ?? 0);

  const totalLeadRows = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.isDuplicate, false));
  const totalLeads = Number(totalLeadRows[0]?.count ?? 0);

  return { views: { home: views.home ?? 0, vsl: views.vsl ?? 0, termin: views.termin ?? 0 }, leads: leadsInPeriod, totalLeads };
}

export async function getDailySeries(days: number) {
  const db = await getDb();
  if (!db) return [];
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  start.setHours(0, 0, 0, 0);

  const rows = await db
    .select({ day: sql<string>`DATE(${pageViews.createdAt})`, page: pageViews.page, count: sql<number>`count(*)` })
    .from(pageViews)
    .where(gte(pageViews.createdAt, start))
    .groupBy(sql`DATE(${pageViews.createdAt})`, pageViews.page);

  return rows.map((r) => ({ day: r.day, page: r.page, count: Number(r.count) }));
}

// ─── PER-CHANNEL FUNNEL STATS ──────────────────────────────────────────────────

export interface ChannelFunnelStats {
  channel: Channel;
  visitors: number;
  leads: number;
  appointments: number;
  lpCr: number;
  terminCr: number;
  adSpendCents: number;
  cpl: number;
}

export async function getFunnelStatsByChannel(periodOrRange: Period | { startDate: string; endDate: string }): Promise<ChannelFunnelStats[]> {
  const db = await getDb();
  if (!db) return CHANNELS.map((ch) => ({ channel: ch, visitors: 0, leads: 0, appointments: 0, lpCr: 0, terminCr: 0, adSpendCents: 0, cpl: 0 }));

  let start: Date;
  let endDate: Date | null = null;
  if (typeof periodOrRange === "string") {
    start = periodStart(periodOrRange);
  } else {
    const range = dateRangeToStartEnd(periodOrRange.startDate, periodOrRange.endDate);
    start = range.start;
    endDate = range.end;
  }

  const viewConditions = endDate
    ? and(gte(pageViews.createdAt, start), lte(pageViews.createdAt, endDate))
    : gte(pageViews.createdAt, start);
  const viewRows = await db
    .select({ page: pageViews.page, count: sql<number>`count(*)` })
    .from(pageViews)
    .where(viewConditions)
    .groupBy(pageViews.page);
  const viewMap: Record<string, number> = {};
  for (const r of viewRows) viewMap[r.page] = Number(r.count);

  const leadConditions = endDate
    ? and(gte(leads.createdAt, start), lte(leads.createdAt, endDate), eq(leads.isDuplicate, false))
    : and(gte(leads.createdAt, start), eq(leads.isDuplicate, false));
  const leadRows = await db
    .select({ source: leads.source, count: sql<number>`count(*)` })
    .from(leads)
    .where(leadConditions)
    .groupBy(leads.source);
  const leadMap: Record<string, number> = {};
  for (const r of leadRows) leadMap[r.source] = Number(r.count);

  const apptConditions = endDate
    ? and(gte(appointments.createdAt, start), lte(appointments.createdAt, endDate))
    : gte(appointments.createdAt, start);
  const apptRows = await db
    .select({ source: appointments.source, count: sql<number>`count(*)` })
    .from(appointments)
    .where(apptConditions)
    .groupBy(appointments.source);
  const apptMap: Record<string, number> = {};
  let totalAppts = 0;
  for (const r of apptRows) {
    apptMap[r.source] = Number(r.count);
    totalAppts += Number(r.count);
  }

  // Filter ad_spend by the `date` column (YYYY-MM-DD string) to match the selected period
  const startDateStr = start.toISOString().slice(0, 10);
  const endDateStr = endDate ? endDate.toISOString().slice(0, 10) : null;
  const spendConditions = endDateStr
    ? and(gte(adSpend.date, startDateStr), lte(adSpend.date, endDateStr))
    : gte(adSpend.date, startDateStr);
  const spendRows = await db
    .select({ channel: adSpend.channel, total: sql<number>`SUM(${adSpend.amountCents})` })
    .from(adSpend)
    .where(spendConditions)
    .groupBy(adSpend.channel);
  const spendMap: Record<string, number> = {};
  for (const r of spendRows) spendMap[r.channel] = Number(r.total ?? 0);

  const channelResults = CHANNELS.map((ch) => {
    const visitors = CHANNEL_PAGES[ch].reduce((sum, p) => sum + (viewMap[p] ?? 0), 0);
    const channelLeads = CHANNEL_SOURCES[ch].reduce((sum, s) => sum + (leadMap[s] ?? 0), 0);
    const channelAppts = apptMap[ch] ?? 0;
    const channelSpend = spendMap[ch] ?? 0;
    const lpCr = visitors > 0 ? channelLeads / visitors : 0;
    const terminCr = channelLeads > 0 ? channelAppts / channelLeads : 0;
    const cpl = channelLeads > 0 ? Math.round(channelSpend / channelLeads) : 0;

    return { channel: ch, visitors, leads: channelLeads, appointments: channelAppts, lpCr, terminCr, adSpendCents: channelSpend, cpl };
  });

  // Add a "gesamt" row that includes ALL appointments (also those from other/klicktipp sources)
  const gesamtVisitors = channelResults.reduce((s, c) => s + c.visitors, 0);
  const gesamtLeads = channelResults.reduce((s, c) => s + c.leads, 0);
  const gesamtSpend = channelResults.reduce((s, c) => s + c.adSpendCents, 0);
  const gesamtLpCr = gesamtVisitors > 0 ? gesamtLeads / gesamtVisitors : 0;
  const gesamtTerminCr = gesamtLeads > 0 ? totalAppts / gesamtLeads : 0;
  const gesamtCpl = gesamtLeads > 0 ? Math.round(gesamtSpend / gesamtLeads) : 0;

  channelResults.push({
    channel: "gesamt" as any,
    visitors: gesamtVisitors,
    leads: gesamtLeads,
    appointments: totalAppts,
    lpCr: gesamtLpCr,
    terminCr: gesamtTerminCr,
    adSpendCents: gesamtSpend,
    cpl: gesamtCpl,
  });

  return channelResults;
}

// ─── PER-CHANNEL DAILY SERIES ─────────────────────────────────────────────────

export interface ChannelDayPoint {
  day: string;
  channel: Channel;
  visitors: number;
  leads: number;
  appointments: number;
  adSpendCents: number;
}

export async function getChannelSeries(daysOrRange: number | { startDate: string; endDate: string }): Promise<ChannelDayPoint[]> {
  const db = await getDb();
  if (!db) return [];

  let start: Date;
  let end: Date;
  if (typeof daysOrRange === "number") {
    start = new Date();
    start.setDate(start.getDate() - (daysOrRange - 1));
    start.setHours(0, 0, 0, 0);
    end = new Date();
  } else {
    const range = dateRangeToStartEnd(daysOrRange.startDate, daysOrRange.endDate);
    start = range.start;
    end = range.end;
  }
  const startStr = start.toISOString().slice(0, 19).replace("T", " ");

  const endStr = end.toISOString().slice(0, 19).replace("T", " ");
  const startDateOnly = start.toISOString().slice(0, 10);
  const endDateOnly = end.toISOString().slice(0, 10);

  const pvResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, page, count(*) as count FROM page_views WHERE createdAt >= ${startStr} AND createdAt <= ${endStr} GROUP BY DATE(createdAt), page`
  );
  const pvRows = (pvResult as unknown as any[][])[0] ?? [];

  const leadResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, source, count(*) as count FROM leads WHERE createdAt >= ${startStr} AND createdAt <= ${endStr} AND isDuplicate = 0 GROUP BY DATE(createdAt), source`
  );
  const leadRows = (leadResult as unknown as any[][])[0] ?? [];

  const apptResult = await db.execute(
    sql`SELECT DATE(createdAt) as day, source, count(*) as count FROM appointments WHERE createdAt >= ${startStr} AND createdAt <= ${endStr} GROUP BY DATE(createdAt), source`
  );
  const apptRows = (apptResult as unknown as any[][])[0] ?? [];

  const spendResult = await db.execute(
    sql`SELECT date as day, channel, SUM(amountCents) as total FROM ad_spend WHERE date >= ${startDateOnly} AND date <= ${endDateOnly} GROUP BY date, channel`
  );
  const spendRows = (spendResult as unknown as any[][])[0] ?? [];

  const allDays: string[] = [];
  const d = new Date(start);
  while (d <= end) {
    allDays.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }

  const result: ChannelDayPoint[] = [];

  for (const day of allDays) {
    for (const ch of CHANNELS) {
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

      result.push({ day, channel: ch, visitors, leads: channelLeads, appointments: channelAppts, adSpendCents: channelSpend });
    }
  }

  return result;
}

// ─── APPOINTMENTS ──────────────────────────────────────────────────────────────

export async function insertAppointment(data: InsertAppointment): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(appointments).values(data);
  const insertId = (result as unknown as [{ insertId: number }])[0]?.insertId;
  return insertId ?? null;
}

// ─── PER-CHANNEL WEBHOOKS ──────────────────────────────────────────────────────

export async function getWebhookByChannel(channel: string): Promise<{ url: string; active: boolean } | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(webhooks).where(eq(webhooks.channel, channel)).limit(1);
  if (rows.length === 0) return null;
  return { url: rows[0].url ?? "", active: rows[0].active === 1 };
}

export async function getAllWebhooks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(webhooks).orderBy(webhooks.channel);
}

export async function setWebhookByChannel(channel: string, url: string, active: boolean = true) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(webhooks)
    .values({ channel, url, active: active ? 1 : 0 })
    .onDuplicateKeyUpdate({ set: { url, active: active ? 1 : 0 } });
}

// ─── AD SPEND ──────────────────────────────────────────────────────────────────

export async function setAdSpend(channel: string, date: string, amountCents: number, campaignName?: string, notes?: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db
    .select()
    .from(adSpend)
    .where(and(eq(adSpend.channel, channel), eq(adSpend.date, date)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adSpend)
      .set({ amountCents, campaignName: campaignName ?? null, notes: notes ?? null })
      .where(and(eq(adSpend.channel, channel), eq(adSpend.date, date)));
  } else {
    await db.insert(adSpend).values({ channel, date, amountCents, campaignName: campaignName ?? null, notes: notes ?? null });
  }
}

/** Bulk-Import von Ad-Costs (z.B. aus CSV). */
export async function bulkImportAdSpend(rows: Array<{ channel: string; date: string; amountCents: number; campaignName?: string; notes?: string }>) {
  for (const row of rows) {
    await setAdSpend(row.channel, row.date, row.amountCents, row.campaignName, row.notes);
  }
  return { imported: rows.length };
}

export async function getAdSpendByChannel(channel: string, period: Period) {
  const db = await getDb();
  if (!db) return [];
  const start = periodStart(period);
  return db
    .select()
    .from(adSpend)
    .where(and(eq(adSpend.channel, channel), gte(adSpend.date, start.toISOString().slice(0, 10))))
    .orderBy(adSpend.date);
}

/** Alle Ad-Spend-Einträge laden. */
export async function listAdSpend() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adSpend).orderBy(desc(adSpend.date));
}

// ─── WEBHOOK FIRE ──────────────────────────────────────────────────────────────

export async function fireChannelWebhook(channel: string, payload: Record<string, unknown>): Promise<"sent" | "failed" | "none"> {
  const wh = await getWebhookByChannel(channel);
  if (!wh || !wh.url || !wh.active) {
    const globalUrl = await getSetting("webhook_url");
    if (!globalUrl) return "none";
    try {
      const res = await fetch(globalUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return res.ok ? "sent" : "failed";
    } catch (e) {
      console.error("[Webhook] Versand fehlgeschlagen:", e);
      return "failed";
    }
  }
  try {
    const res = await fetch(wh.url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return res.ok ? "sent" : "failed";
  } catch (e) {
    console.error("[Webhook] Versand fehlgeschlagen:", e);
    return "failed";
  }
}

export async function fireWebhook(payload: Record<string, unknown>): Promise<"sent" | "failed" | "none"> {
  const url = await getSetting("webhook_url");
  if (!url) return "none";
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    return res.ok ? "sent" : "failed";
  } catch (e) {
    console.error("[Webhook] Versand fehlgeschlagen:", e);
    return "failed";
  }
}
