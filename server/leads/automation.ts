/**
 * Lead Automation Pipeline
 * Handles: KlickTipp (direct API), SalesSuite CRM (direct API), Make.com Webhook (for Slack + Google Sheets)
 *
 * Architecture:
 * - KlickTipp: Direct HTTP POST to /subscriber/signin
 * - SalesSuite: Direct HTTP calls to create/update contacts + deals + notes
 * - Make.com Webhook: One webhook per funnel, sends ALL lead data. Make handles Slack + Google Sheets.
 */

// ─── Types ───────────────────────────────────────────────────────────────────
export type FunnelType = "ki-report" | "exit-plan" | "traumwebseite";

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  funnel: FunnelType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
}

export interface AutomationResult {
  klicktipp: { success: boolean; error?: string };
  salesSuite: { success: boolean; error?: string; contactId?: string; dealId?: string };
  makeWebhook: { success: boolean; error?: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────
const SALESSUITE_BASE = "https://api.salessuite.com/api";
const KLICKTIPP_BASE = "https://api.klicktipp.com";

// SalesSuite Setter/Closer Pipeline
const PIPELINE_ID = "cmr0xq72s01od8u01h78u0wz1";
const PHASE_ANFRAGE = "cmr0xq73101oe8u01s0bobpab"; // "Anfrage eingegangen"
const PHASE_VERKAUFT = "cmr0xq73101oj8u01a4dzu7qa"; // "Verkauft"

// Funnel → SalesSuite custom field mapping
const FUNNEL_FIELD_MAP: Record<FunnelType, string> = {
  "ki-report": "x_leadmagnet_ki_report",
  "exit-plan": "x_leadmagnet_exit_plan",
  "traumwebseite": "x_vsl_traumwebseite_lead",
};

// Funnel display names
const FUNNEL_DISPLAY: Record<FunnelType, string> = {
  "ki-report": "KI-Report 2026",
  "exit-plan": "Exit-Plan",
  "traumwebseite": "VSL_Traumwebseite",
};

// Make.com Webhook URLs per funnel (configured via env or DB settings)
// These are set in the admin dashboard under Webhook-Einstellungen per channel
const MAKE_WEBHOOK_URLS: Record<FunnelType, string | undefined> = {
  "traumwebseite": process.env.MAKE_WEBHOOK_TRAUMWEBSEITE || undefined,
  "ki-report": process.env.MAKE_WEBHOOK_KI_REPORT || undefined,
  "exit-plan": process.env.MAKE_WEBHOOK_EXIT_PLAN || undefined,
};

// ─── Phone Validation ────────────────────────────────────────────────────────
/**
 * Normalize German phone number to E.164 format (+49...)
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Handle common German formats
  if (cleaned.startsWith("00")) {
    cleaned = "+" + cleaned.slice(2);
  } else if (cleaned.startsWith("0")) {
    cleaned = "+49" + cleaned.slice(1);
  } else if (cleaned.startsWith("49") && !cleaned.startsWith("+")) {
    cleaned = "+49" + cleaned.slice(2);
  } else if (!cleaned.startsWith("+")) {
    // Assume German number without prefix
    cleaned = "+49" + cleaned;
  }

  // Ensure it starts with +
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── KlickTipp Integration ──────────────────────────────────────────────────
async function processKlickTipp(lead: LeadData): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.KLICKTIPP_API_KEY;
  if (!apiKey) return { success: false, error: "KLICKTIPP_API_KEY not set" };

  try {
    // Build fields object
    const fields: Record<string, string> = {
      fieldFirstName: lead.firstName,
      fieldLastName: lead.lastName,
      fieldMobilePhone: lead.phone,
    };

    const body = {
      apikey: apiKey,
      email: lead.email,
      smsnumber: lead.phone,
      fields,
    };

    const res = await fetch(`${KLICKTIPP_BASE}/subscriber/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 200 || res.status === 201) {
      return { success: true };
    }

    const errorData = await res.text();
    console.error("[KlickTipp] Error:", res.status, errorData);
    return { success: false, error: `HTTP ${res.status}: ${errorData}` };
  } catch (err: any) {
    console.error("[KlickTipp] Exception:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── SalesSuite Integration ──────────────────────────────────────────────────
async function processSalesSuite(
  lead: LeadData
): Promise<{ success: boolean; error?: string; contactId?: string; dealId?: string }> {
  const apiKey = process.env.SALESSUITE_API_KEY;
  if (!apiKey) return { success: false, error: "SALESSUITE_API_KEY not set" };

  const headers = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const now = new Date().toISOString();
  const funnelField = FUNNEL_FIELD_MAP[lead.funnel];

  try {
    // 1. Check if contact exists by email
    const searchRes = await fetch(
      `${SALESSUITE_BASE}/v1/contact/by-email?email=${encodeURIComponent(lead.email)}`,
      { headers: { "x-api-key": apiKey } }
    );

    let contactId: string | undefined;
    let isExistingContact = false;

    if (searchRes.ok) {
      const contacts = await searchRes.json();
      if (Array.isArray(contacts) && contacts.length > 0) {
        contactId = contacts[0].contact?.id;
        isExistingContact = true;
      }
    }

    // 2. Create or update contact
    if (!contactId) {
      // Create new contact
      const createBody = {
        contact: {
          utm_source: lead.utmSource || null,
          utm_medium: lead.utmMedium || null,
          utm_campaign: lead.utmCampaign || null,
          utm_content: lead.utmContent || null,
          utm_term: lead.utmTerm || null,
          referer: lead.referrer || null,
          leadSource: `Fast-Track Funnel: ${FUNNEL_DISPLAY[lead.funnel]}`,
          x_lead_erhalten_am: now.split("T")[0], // Date only
          [funnelField]: now,
        },
        contactPerson: {
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
        },
        skipExistingContactPersonEmailCheck: true,
      };

      const createRes = await fetch(`${SALESSUITE_BASE}/v1/contact/create`, {
        method: "POST",
        headers,
        body: JSON.stringify(createBody),
      });

      if (createRes.ok) {
        const created = await createRes.json();
        contactId = created.id || created.contact?.id;
      } else {
        const errText = await createRes.text();
        console.error("[SalesSuite] Create contact error:", createRes.status, errText);
        // If 409 (email exists), try to find again
        if (createRes.status === 409) {
          const retry = await fetch(
            `${SALESSUITE_BASE}/v1/contact/by-email?email=${encodeURIComponent(lead.email)}`,
            { headers: { "x-api-key": apiKey } }
          );
          if (retry.ok) {
            const retryData = await retry.json();
            if (Array.isArray(retryData) && retryData.length > 0) {
              contactId = retryData[0].contact?.id;
              isExistingContact = true;
            }
          }
        }
        if (!contactId) {
          return { success: false, error: `Create contact failed: ${createRes.status}` };
        }
      }
    } else {
      // Update existing contact with leadmagnet field
      const patchBody: Record<string, any> = {
        [funnelField]: now,
      };
      // Also update UTM if provided
      if (lead.utmSource) patchBody.utm_source = lead.utmSource;
      if (lead.utmMedium) patchBody.utm_medium = lead.utmMedium;
      if (lead.utmCampaign) patchBody.utm_campaign = lead.utmCampaign;

      await fetch(`${SALESSUITE_BASE}/v2/contact/${contactId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patchBody),
      }).catch(() => {});
    }

    // 3. Check existing deals
    let dealId: string | undefined;
    let hasVerkauftDeal = false;
    let hasSetterCloserDeal = false;
    let existingDealId: string | undefined;

    const dealsRes = await fetch(
      `${SALESSUITE_BASE}/v1/deal/by-email?email=${encodeURIComponent(lead.email)}`,
      { headers: { "x-api-key": apiKey } }
    );

    if (dealsRes.ok) {
      const deals = await dealsRes.json();
      if (Array.isArray(deals)) {
        for (const deal of deals) {
          const d = deal.deal || deal;
          if (d.phaseId === PHASE_VERKAUFT) {
            hasVerkauftDeal = true;
          }
          // Check if deal is in Setter/Closer pipeline (any phase)
          if (d.pipelineId === PIPELINE_ID || d.pipeline?.id === PIPELINE_ID) {
            hasSetterCloserDeal = true;
            existingDealId = d.id;
          }
        }
      }
    }

    // 4. Create or skip deal
    if (!hasVerkauftDeal && !hasSetterCloserDeal && contactId) {
      // Create new deal in "Anfrage eingegangen"
      const dealBody = {
        contactId,
        phaseId: PHASE_ANFRAGE,
        name: `${lead.firstName} ${lead.lastName} – ${FUNNEL_DISPLAY[lead.funnel]}`,
      };

      const dealRes = await fetch(`${SALESSUITE_BASE}/v2/deal`, {
        method: "POST",
        headers,
        body: JSON.stringify(dealBody),
      });

      if (dealRes.ok) {
        const dealData = await dealRes.json();
        dealId = dealData.id;
      } else {
        console.error("[SalesSuite] Create deal error:", dealRes.status, await dealRes.text());
      }
    } else if (existingDealId) {
      dealId = existingDealId;
    }

    // 5. Add note
    const noteParam = dealId ? `dealId=${dealId}` : `contactId=${contactId}`;
    const noteDate = new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" });
    const noteHtml = `<p>Hat sich am <strong>${noteDate}</strong> den <strong>${FUNNEL_DISPLAY[lead.funnel]}</strong> von <strong>Bewegungsoptimierer</strong> eingetragen.</p>`;

    await fetch(`${SALESSUITE_BASE}/v1/note?${noteParam}`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "text/html" },
      body: noteHtml,
    }).catch((err) => console.error("[SalesSuite] Note error:", err.message));

    return { success: true, contactId, dealId };
  } catch (err: any) {
    console.error("[SalesSuite] Exception:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Make.com Webhook ────────────────────────────────────────────────────────
/**
 * Sends ALL lead data to the Make.com webhook for this funnel.
 * Make handles: Slack notification to #pf-neue-leads + Google Sheets append.
 */
async function processMakeWebhook(lead: LeadData): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = MAKE_WEBHOOK_URLS[lead.funnel];
  if (!webhookUrl) {
    return { success: false, error: `No Make webhook URL configured for funnel: ${lead.funnel}` };
  }

  try {
    const payload = {
      // Lead data
      firstName: lead.firstName,
      lastName: lead.lastName,
      fullName: `${lead.firstName} ${lead.lastName}`.trim(),
      email: lead.email,
      phone: lead.phone,
      funnel: lead.funnel,
      funnelDisplay: FUNNEL_DISPLAY[lead.funnel],
      // UTM data
      utmSource: lead.utmSource || "",
      utmMedium: lead.utmMedium || "",
      utmCampaign: lead.utmCampaign || "",
      utmContent: lead.utmContent || "",
      utmTerm: lead.utmTerm || "",
      referrer: lead.referrer || "",
      // Metadata
      timestamp: new Date().toISOString(),
      timestampDE: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
    };

    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      return { success: true };
    }

    const errorText = await res.text();
    console.error("[MakeWebhook] Error:", res.status, errorText);
    return { success: false, error: `HTTP ${res.status}: ${errorText}` };
  } catch (err: any) {
    console.error("[MakeWebhook] Exception:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Main Pipeline ───────────────────────────────────────────────────────────
/**
 * Process a new opt-in lead through all integrations.
 * Runs all integrations in parallel for speed, collects results.
 */
export async function processLeadAutomation(lead: LeadData): Promise<AutomationResult> {
  // Normalize phone
  lead.phone = normalizePhone(lead.phone);
  lead.email = lead.email.trim().toLowerCase();

  // Run all integrations in parallel
  const [klicktipp, salesSuite, makeWebhook] = await Promise.allSettled([
    processKlickTipp(lead),
    processSalesSuite(lead),
    processMakeWebhook(lead),
  ]);

  return {
    klicktipp: klicktipp.status === "fulfilled" ? klicktipp.value : { success: false, error: "Promise rejected" },
    salesSuite: salesSuite.status === "fulfilled" ? salesSuite.value : { success: false, error: "Promise rejected" },
    makeWebhook: makeWebhook.status === "fulfilled" ? makeWebhook.value : { success: false, error: "Promise rejected" },
  };
}
