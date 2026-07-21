/**
 * Meta Ads Refresh - Fetches daily spend from Meta Graph API via the built-in Data API
 * and upserts into the ad_spend table.
 * 
 * Uses the Forge Data API proxy to call Meta Marketing API endpoints.
 */
import { setAdSpend } from "./funnel-db";
import { CAMPAIGN_FUNNEL_MAP, AD_ACCOUNT_ID } from "./ad-costs-sync";
import { callDataApi } from "./_core/dataApi";

interface MetaInsightRow {
  spend: string;
  date_start: string;
  date_stop: string;
  campaign_id?: string;
  campaign_name?: string;
}

/**
 * Fetch daily spend from Meta Ads for all mapped campaigns since a given start date.
 * Returns the number of records upserted.
 */
export async function refreshMetaAdCosts(sinceDate?: string): Promise<{ upserted: number; errors: string[] }> {
  const errors: string[] = [];
  let upserted = 0;

  // Default: fetch from July 14, 2026 (campaign start)
  const startDate = sinceDate || "2026-07-14";
  const today = new Date().toISOString().slice(0, 10);

  for (const [campaignId, mapping] of Object.entries(CAMPAIGN_FUNNEL_MAP)) {
    try {
      // Call Meta Marketing API via Data API proxy
      // The Meta Marketing MCP uses the Graph API pattern:
      // GET /{campaign_id}/insights?fields=spend&time_range=...&time_increment=1
      const result = await callDataApi("Meta/insights", {
        query: {
          object_id: campaignId,
          level: "campaign",
          fields: "spend,campaign_name",
          time_range: JSON.stringify({ since: startDate, until: today }),
          time_increment: "1", // daily breakdown
        },
      });

      // Parse the response
      const data = result as { data?: MetaInsightRow[] } | MetaInsightRow[];
      const rows: MetaInsightRow[] = Array.isArray(data) ? data : (data?.data ?? []);

      for (const row of rows) {
        if (!row.spend || !row.date_start) continue;
        const amountCents = Math.round(parseFloat(row.spend) * 100);
        if (isNaN(amountCents) || amountCents === 0) continue;

        await setAdSpend(
          mapping.channel,
          row.date_start,
          amountCents,
          row.campaign_name || `Campaign ${campaignId}`,
          "Meta Ads API Refresh",
        );
        upserted++;
      }
    } catch (err: any) {
      const msg = `Campaign ${campaignId} (${mapping.channel}): ${err.message || "Unknown error"}`;
      errors.push(msg);
      console.error("[meta-ads-refresh]", msg);
    }
  }

  return { upserted, errors };
}
