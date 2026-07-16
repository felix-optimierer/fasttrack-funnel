# Meta Ads Integration Reference

## Ad Account
- ID: act_2652745474927267
- Name: Critical Physio
- Business: Bewegungsoptimierer GmbH
- Currency: EUR

## Campaigns to Track
| Campaign | ID | Funnel |
|----------|-----|--------|
| FB_14.07.2026 \| VSL_Leads Traumwebseite \| A+ V1 | 120250432788160563 | traumwebseite |
| FB_15.07.2026 \| LM_Exit-Plan \| V1 | 120250479972680563 | exit-plan |
| KI-Report (TBD) | TBD | ki-report |

## MCP Tool Usage
- Server: meta-marketing
- Tool: meta_marketing_get_insights
- Parameters:
  - object_id: campaign ID
  - object_type: "campaign"
  - time_range: { since: "YYYY-MM-DD", until: "YYYY-MM-DD" }
- Response fields: campaign_name, impressions, clicks, spend, ctr

## Scheduled Endpoint
- Path: /api/scheduled/sync-ad-costs
- Method: POST
- Body: { entries: [{ date, funnel, campaignId, campaignName, spend, impressions, clicks }] }

## Cron Schedule
- Daily 00:30 UTC: Sync previous day final costs
- Every 6 hours: Update current day costs
- Manual: Admin button triggers immediate refresh

## Agent Cron Prompt Template
The agent cron should:
1. Use meta_marketing_get_insights for each campaign
2. Query today's date and yesterday (for the daily 00:30 run)
3. POST results to $SCHEDULED_TASK_ENDPOINT_BASE/api/scheduled/sync-ad-costs
4. Auth via Cookie: app_session_id=$SCHEDULED_TASK_COOKIE
