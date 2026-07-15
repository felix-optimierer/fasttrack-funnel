/**
 * Weekly Funnel KPI Report
 * Sends a summary email every Monday with:
 * - Visitors per funnel
 * - Signups (leads) per funnel
 * - Conversion rates per funnel
 * - Week-over-week comparison
 */
import { Request, Response } from "express";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { sendEmail } from "./email";
import { sdk } from "./_core/sdk";

const REPORT_RECIPIENT = "felix@onboarding-prozesse.de";

// Funnel page → display name mapping
const FUNNEL_CONFIG = [
  { page: "traumwebseite", source: "home", label: "VSL Traumwebseite" },
  { page: "ki-report", source: "ki-report", label: "LM KI-Report" },
  { page: "exit-plan", source: "exit-plan", label: "LM Exit-Plan" },
];

interface FunnelMetrics {
  label: string;
  visitors: number;
  uniqueVisitors: number;
  leads: number;
  conversionRate: string;
  // Previous week for comparison
  prevVisitors: number;
  prevLeads: number;
  prevConversionRate: string;
  visitorChange: string;
  leadChange: string;
}

async function getMetrics(startDate: Date, endDate: Date, prevStartDate: Date, prevEndDate: Date): Promise<FunnelMetrics[]> {
  const metrics: FunnelMetrics[] = [];
  const db = (await getDb())!;

  for (const funnel of FUNNEL_CONFIG) {
    // Current week visitors
    const [visitorsResult] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT visitorId) as unique_visitors
      FROM page_views 
      WHERE page = ${funnel.page} 
        AND createdAt >= ${startDate} 
        AND createdAt < ${endDate}
    `);

    // Current week leads
    const [leadsResult] = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM leads 
      WHERE source = ${funnel.source} 
        AND createdAt >= ${startDate} 
        AND createdAt < ${endDate}
    `);

    // Previous week visitors
    const [prevVisitorsResult] = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT visitorId) as unique_visitors
      FROM page_views 
      WHERE page = ${funnel.page} 
        AND createdAt >= ${prevStartDate} 
        AND createdAt < ${prevEndDate}
    `);

    // Previous week leads
    const [prevLeadsResult] = await db.execute(sql`
      SELECT COUNT(*) as total
      FROM leads 
      WHERE source = ${funnel.source} 
        AND createdAt >= ${prevStartDate} 
        AND createdAt < ${prevEndDate}
    `);

    const visitors = Number((visitorsResult as any)?.total ?? 0);
    const uniqueVisitors = Number((visitorsResult as any)?.unique_visitors ?? 0);
    const leads = Number((leadsResult as any)?.total ?? 0);
    const prevVisitors = Number((prevVisitorsResult as any)?.total ?? 0);
    const prevLeads = Number((prevLeadsResult as any)?.total ?? 0);

    const conversionRate = visitors > 0 ? ((leads / visitors) * 100).toFixed(2) : "0,00";
    const prevConversionRate = prevVisitors > 0 ? ((prevLeads / prevVisitors) * 100).toFixed(2) : "0,00";

    const visitorChange = prevVisitors > 0 
      ? (((visitors - prevVisitors) / prevVisitors) * 100).toFixed(1) 
      : "–";
    const leadChange = prevLeads > 0 
      ? (((leads - prevLeads) / prevLeads) * 100).toFixed(1) 
      : "–";

    metrics.push({
      label: funnel.label,
      visitors,
      uniqueVisitors,
      leads,
      conversionRate: conversionRate.replace(".", ","),
      prevVisitors,
      prevLeads,
      prevConversionRate: prevConversionRate.replace(".", ","),
      visitorChange,
      leadChange,
    });
  }

  return metrics;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function buildEmailHtml(metrics: FunnelMetrics[], weekStart: Date, weekEnd: Date, prevWeekStart: Date): string {
  const totalVisitors = metrics.reduce((sum, m) => sum + m.visitors, 0);
  const totalLeads = metrics.reduce((sum, m) => sum + m.leads, 0);
  const totalConversion = totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(2).replace(".", ",") : "0,00";

  const funnelRows = metrics.map(m => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #1e293b;">${m.label}</td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">
        ${m.visitors.toLocaleString("de-DE")}
        ${m.visitorChange !== "–" ? `<br><span style="font-size: 11px; color: ${parseFloat(m.visitorChange) >= 0 ? "#16a34a" : "#dc2626"};">${parseFloat(m.visitorChange) >= 0 ? "+" : ""}${m.visitorChange}%</span>` : ""}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">
        ${m.uniqueVisitors.toLocaleString("de-DE")}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">
        ${m.leads.toLocaleString("de-DE")}
        ${m.leadChange !== "–" ? `<br><span style="font-size: 11px; color: ${parseFloat(m.leadChange) >= 0 ? "#16a34a" : "#dc2626"};">${parseFloat(m.leadChange) >= 0 ? "+" : ""}${m.leadChange}%</span>` : ""}
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600; color: ${parseFloat(m.conversionRate.replace(",", ".")) >= 5 ? "#16a34a" : parseFloat(m.conversionRate.replace(",", ".")) >= 2 ? "#ca8a04" : "#dc2626"};">
        ${m.conversionRate}%
      </td>
    </tr>
  `).join("");

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0f172a;">
        <h1 style="color: #0f172a; font-size: 22px; margin: 0;">Wöchentlicher Funnel-Report</h1>
        <p style="color: #64748b; font-size: 14px; margin-top: 6px;">
          KW ${getWeekNumber(weekStart)} | ${formatDate(weekStart)} – ${formatDate(new Date(weekEnd.getTime() - 86400000))}
        </p>
      </div>

      <!-- Summary Cards -->
      <div style="display: flex; gap: 12px; margin-bottom: 30px;">
        <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
          <div style="font-size: 24px; font-weight: 700; color: #0f172a;">${totalVisitors.toLocaleString("de-DE")}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Besucher gesamt</div>
        </div>
        <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
          <div style="font-size: 24px; font-weight: 700; color: #0f172a;">${totalLeads.toLocaleString("de-DE")}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Leads gesamt</div>
        </div>
        <div style="flex: 1; background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; border: 1px solid #e2e8f0;">
          <div style="font-size: 24px; font-weight: 700; color: ${parseFloat(totalConversion.replace(",", ".")) >= 5 ? "#16a34a" : "#ca8a04"};">${totalConversion}%</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Conversion gesamt</div>
        </div>
      </div>

      <!-- Funnel Table -->
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
        <thead>
          <tr style="background: #0f172a;">
            <th style="padding: 12px 16px; text-align: left; color: #ffffff; font-size: 13px;">Funnel</th>
            <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 13px;">Besucher</th>
            <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 13px;">Unique</th>
            <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 13px;">Leads</th>
            <th style="padding: 12px 16px; text-align: center; color: #ffffff; font-size: 13px;">CVR</th>
          </tr>
        </thead>
        <tbody>
          ${funnelRows}
          <tr style="background: #f8fafc;">
            <td style="padding: 12px 16px; font-weight: 700; color: #0f172a;">Gesamt</td>
            <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: #0f172a;">${totalVisitors.toLocaleString("de-DE")}</td>
            <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: #0f172a;">–</td>
            <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: #0f172a;">${totalLeads.toLocaleString("de-DE")}</td>
            <td style="padding: 12px 16px; text-align: center; font-weight: 700; color: #0f172a;">${totalConversion}%</td>
          </tr>
        </tbody>
      </table>

      <!-- Comparison note -->
      <p style="color: #94a3b8; font-size: 12px; margin-top: 12px; text-align: center;">
        Prozentuale Veränderungen beziehen sich auf die Vorwoche (${formatDate(prevWeekStart)} – ${formatDate(new Date(weekStart.getTime() - 86400000))})
      </p>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">
          Automatisch generiert vom Fast-Track Funnel System<br>
          ${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}
        </p>
      </div>
    </div>
  `;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export async function sendWeeklyReport(): Promise<{ ok: boolean; error?: string }> {
  try {
    // Calculate date ranges (last full week: Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon, ...
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Last week Monday 00:00 UTC
    const weekEnd = new Date(now);
    weekEnd.setUTCDate(now.getUTCDate() - daysToLastMonday);
    weekEnd.setUTCHours(0, 0, 0, 0);
    
    const weekStart = new Date(weekEnd);
    weekStart.setUTCDate(weekEnd.getUTCDate() - 7);
    
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setUTCDate(weekStart.getUTCDate() - 7);

    const metrics = await getMetrics(weekStart, weekEnd, prevWeekStart, weekStart);
    const html = buildEmailHtml(metrics, weekStart, weekEnd, prevWeekStart);

    const totalLeads = metrics.reduce((sum, m) => sum + m.leads, 0);
    const weekNumber = getWeekNumber(weekStart);

    const result = await sendEmail({
      to: REPORT_RECIPIENT,
      subject: `Funnel-Report KW ${weekNumber}: ${totalLeads} Leads`,
      html,
      tags: [{ name: "type", value: "weekly-report" }],
    });

    if (!result.success) {
      return { ok: false, error: result.error };
    }

    console.log(`[WeeklyReport] Sent KW ${weekNumber} report. ${totalLeads} leads total.`);
    return { ok: true };
  } catch (error: any) {
    console.error("[WeeklyReport] Error:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Express handler for the Heartbeat cron endpoint
 */
export async function weeklyReportHandler(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!(user as any).isCron) {
      res.status(403).json({ error: "cron-only" });
      return;
    }

    const result = await sendWeeklyReport();
    
    if (result.ok) {
      res.json({ ok: true, message: "Weekly report sent" });
    } else {
      res.status(500).json({ error: result.error, timestamp: new Date().toISOString() });
    }
  } catch (error: any) {
    console.error("[WeeklyReport Heartbeat] Error:", error);
    res.status(500).json({
      error: error.message ?? "Unknown error",
      stack: error.stack,
      context: { url: req.url },
      timestamp: new Date().toISOString(),
    });
  }
}
