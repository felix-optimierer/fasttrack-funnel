/**
 * Ad Costs Sync Handler
 * When called by Heartbeat cron (no body/empty entries): fetches spend from Meta Marketing API directly.
 * When called with entries in body: upserts those entries (legacy AGENT mode).
 * This feeds directly into the CPL calculations and dashboard stats.
 */
import type { Request, Response } from "express";
import { setAdSpend } from "./funnel-db";

// Campaign → Funnel (channel) mapping
// Active campaigns on act_2652745474927267 (Critical Physio / Bewegungsoptimierer GmbH)
export const CAMPAIGN_FUNNEL_MAP: Record<string, { channel: string; campaignId: string }> = {
  "120250432788160563": { channel: "traumwebseite", campaignId: "120250432788160563" },  // FB_14.07.2026 | VSL_Leads Traumwebseite | A+ V1
  "120250479972680563": { channel: "exit-plan", campaignId: "120250479972680563" },      // FB_15.07.2026 | LM_Exit-Plan | V1
  "120250746019280563": { channel: "praxis-umfrage", campaignId: "120250746019280563" }, // FB_24.07.2026 BO | Evergreen Retargeting Praxisinhaber Umfrage – Kopie
  "120240630952240563": { channel: "praxis-umfrage", campaignId: "120240630952240563" }, // BO | Praxisinhaber Umfrage (ältere Kampagne)
  // KI-Report wird später hinzugefügt wenn Kampagne aktiv
};

export const AD_ACCOUNT_ID = "act_2652745474927267";

interface AdCostEntry {
  date: string; // YYYY-MM-DD
  channel: string; // traumwebseite, exit-plan, praxis-umfrage
  campaignId: string;
  campaignName?: string;
  spend: string; // EUR as string, e.g. "355.46"
  impressions?: number;
  clicks?: number;
}

/**
 * Fetch campaign insights from Meta Marketing API via the built-in data API proxy.
 * Returns daily spend for each campaign in CAMPAIGN_FUNNEL_MAP for yesterday and today.
 */
async function fetchMetaInsights(): Promise<AdCostEntry[]> {
  const { ENV } = await import("./_core/env");
  const baseUrl = (ENV.forgeApiUrl || "").replace(/\/+$/, "");
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error("BUILT_IN_FORGE_API_URL or BUILT_IN_FORGE_API_KEY not configured");
  }

  // Fetch last 3 days to ensure we catch any delayed reporting
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }

  const entries: AdCostEntry[] = [];

  for (const [campaignId, mapping] of Object.entries(CAMPAIGN_FUNNEL_MAP)) {
    for (const date of dates) {
      try {
        // Use the built-in data API to call Meta Marketing insights
        const url = `${baseUrl}/v1/data_api/meta_marketing/insights`;
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            object_type: "campaign",
            object_id: campaignId,
            time_range: { since: date, until: date },
          }),
        });

        if (!resp.ok) {
          console.warn(`[ad-costs-sync] Meta API error for ${campaignId} on ${date}: ${resp.status}`);
          continue;
        }

        const data = await resp.json() as any;
        // The response structure varies - try to extract spend
        let spend = "0";
        let impressions = 0;
        let clicks = 0;
        let campaignName = "";

        if (data?.insights && Array.isArray(data.insights) && data.insights.length > 0) {
          const insight = data.insights[0];
          spend = insight.spend || "0";
          impressions = parseInt(insight.impressions || "0", 10);
          clicks = parseInt(insight.clicks || "0", 10);
          campaignName = insight.campaign_name || "";
        } else if (Array.isArray(data) && data.length > 0) {
          spend = data[0].spend || "0";
          impressions = parseInt(data[0].impressions || "0", 10);
          clicks = parseInt(data[0].clicks || "0", 10);
          campaignName = data[0].campaign_name || "";
        }

        // Only add if there's actual spend
        if (parseFloat(spend) > 0) {
          entries.push({
            date,
            channel: mapping.channel,
            campaignId,
            campaignName,
            spend,
            impressions,
            clicks,
          });
        }
      } catch (err) {
        console.warn(`[ad-costs-sync] Error fetching ${campaignId} for ${date}:`, err);
      }
    }
  }

  return entries;
}

/**
 * Express handler for /api/scheduled/sync-ad-costs
 * Mode 1 (Heartbeat/cron): No entries in body → fetches from Meta API directly
 * Mode 2 (Manual/AGENT): Entries provided in body → upserts directly
 */
export async function syncAdCostsHandler(req: Request, res: Response): Promise<void> {
  try {
    // Import SDK for auth
    const { sdk } = await import("./_core/sdk");
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron && user.openId !== process.env.OWNER_OPEN_ID) {
      res.status(403).json({ error: "unauthorized" });
      return;
    }

    // Determine mode: if entries provided, use them; otherwise fetch from Meta
    let entries: AdCostEntry[] = req.body?.entries;
    let mode = "manual";

    if (!Array.isArray(entries) || entries.length === 0) {
      // Heartbeat mode: fetch from Meta API
      mode = "auto-fetch";
      console.log("[ad-costs-sync] No entries provided, fetching from Meta API...");
      entries = await fetchMetaInsights();
      console.log(`[ad-costs-sync] Fetched ${entries.length} entries from Meta API`);
    }

    if (entries.length === 0) {
      res.json({ ok: true, upserted: 0, mode, message: "No spend data found" });
      return;
    }

    let upserted = 0;
    for (const entry of entries) {
      if (!entry.date || !entry.channel || !entry.spend) continue;
      // Convert EUR string (e.g. "355.46") to cents (35546)
      const amountCents = Math.round(parseFloat(entry.spend) * 100);
      if (isNaN(amountCents) || amountCents <= 0) continue;

      await setAdSpend(
        entry.channel,
        entry.date,
        amountCents,
        entry.campaignName,
        `Meta Ads Auto-Sync (Campaign: ${entry.campaignId})`,
      );
      upserted++;
    }

    res.json({ ok: true, upserted, mode });
  } catch (err: any) {
    console.error("[sync-ad-costs] Error:", err);
    res.status(500).json({
      error: err.message || "Internal error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
