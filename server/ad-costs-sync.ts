/**
 * Ad Costs Sync Handler
 * Receives ad cost data from the AGENT cron and upserts into the existing ad_spend table.
 * This feeds directly into the CPL calculations and dashboard stats.
 */
import type { Request, Response } from "express";
import { setAdSpend } from "./funnel-db";

// Campaign → Funnel (channel) mapping
export const CAMPAIGN_FUNNEL_MAP: Record<string, { channel: string; campaignId: string }> = {
  "120250432788160563": { channel: "traumwebseite", campaignId: "120250432788160563" },
  "120250479972680563": { channel: "exit-plan", campaignId: "120250479972680563" },
  // KI-Report wird später hinzugefügt
};

export const AD_ACCOUNT_ID = "act_2652745474927267";

interface AdCostEntry {
  date: string; // YYYY-MM-DD
  channel: string; // traumwebseite, exit-plan, ki-report
  campaignId: string;
  campaignName?: string;
  spend: string; // EUR as string, e.g. "355.46"
}

/**
 * Express handler for /api/scheduled/sync-ad-costs
 * Receives POST with array of ad cost entries from the AGENT cron.
 * Converts EUR spend to cents and upserts into ad_spend table.
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

    const entries: AdCostEntry[] = req.body?.entries;
    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: "Missing entries array" });
      return;
    }

    let upserted = 0;
    for (const entry of entries) {
      if (!entry.date || !entry.channel || !entry.spend) continue;
      // Convert EUR string (e.g. "355.46") to cents (35546)
      const amountCents = Math.round(parseFloat(entry.spend) * 100);
      if (isNaN(amountCents)) continue;

      await setAdSpend(
        entry.channel,
        entry.date,
        amountCents,
        entry.campaignName,
        `Meta Ads Auto-Sync (Campaign: ${entry.campaignId})`,
      );
      upserted++;
    }

    res.json({ ok: true, upserted });
  } catch (err: any) {
    console.error("[sync-ad-costs] Error:", err);
    res.status(500).json({
      error: err.message || "Internal error",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    });
  }
}
