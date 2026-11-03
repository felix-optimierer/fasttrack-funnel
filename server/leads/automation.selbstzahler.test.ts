import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { processLeadAutomation, type FunnelType, type LeadData } from "./automation";

const lead = (funnel: FunnelType = "selbstzahler"): LeadData => ({
  firstName: "Anna", lastName: "Test", email: "ANNA@example.test", phone: "017612345678",
  funnel, source: funnel, utmSource: "newsletter", utmCampaign: "test",
  pageUrl: `https://example.test/${funnel}`,
});

let fetchMock: ReturnType<typeof vi.fn>;
const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
const requests = () => fetchMock.mock.calls.map(([url, init]) => ({
  url: String(url), init, body: init?.body ? String(init.body) : "",
}));

beforeEach(() => {
  vi.stubEnv("KLICKTIPP_API_KEY", "mock-klicktipp-key");
  vi.stubEnv("SALESSUITE_API_KEY", "");
  vi.stubEnv("MAKE_WEBHOOK_SELBSTZAHLER", "");
  // Existing funnel URLs must never be used as a fallback.
  vi.stubEnv("MAKE_WEBHOOK_TRAUMWEBSEITE", "https://example.test/make/traumwebseite");
  vi.stubEnv("MAKE_WEBHOOK_KI_REPORT", "https://example.test/make/ki-report");
  vi.stubEnv("MAKE_WEBHOOK_EXIT_PLAN", "https://example.test/make/exit-plan");
  fetchMock = vi.fn().mockResolvedValue(json({}));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Selbstzahler automation mapping (no real external services)", () => {
  it("skips KlickTipp and unconfigured Make instead of reusing another offer", async () => {
    const result = await processLeadAutomation(lead());
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.klicktipp).toMatchObject({ success: false, skipped: true });
    expect(result.klicktipp.error).toContain("dedicated source/tag mapping");
    expect(result.makeWebhook).toMatchObject({ success: false, skipped: true });
    expect(result.makeWebhook.error).toContain("selbstzahler");
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("Sheets/Slack automation skipped"));
  });

  it("sends its own source and readable label to the explicitly configured Make hook", async () => {
    vi.stubEnv("MAKE_WEBHOOK_SELBSTZAHLER", "https://example.test/make/selbstzahler");
    const result = await processLeadAutomation(lead());
    expect(result.makeWebhook.success).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [request] = requests();
    expect(request.url).toBe("https://example.test/make/selbstzahler");
    expect(JSON.parse(request.body)).toMatchObject({
      funnel: "selbstzahler", source: "selbstzahler", funnelDisplay: "Selbstzahler",
      email: "anna@example.test", phone: "+4917612345678", utmCampaign: "test",
      pageUrl: "https://example.test/selbstzahler",
    });
    expect(request.body).not.toMatch(/traumwebseite|exit-plan|ki-report|download|tagId/i);
  });

  it.each([false, true])("retains source in generic CRM without foreign/undefined custom fields (existing=%s)", async (existing) => {
    vi.stubEnv("SALESSUITE_API_KEY", "mock-crm-key");
    fetchMock.mockImplementation(async (url: string) => {
      if (url.includes("/contact/by-email")) return json(existing ? [{ contact: { id: "mock-contact" } }] : []);
      if (url.endsWith("/contact/create")) return json({ id: "mock-contact" });
      if (url.includes("/deal/by-email")) return json([]);
      if (url.endsWith("/v2/deal")) return json({ id: "mock-deal" });
      return json({});
    });
    const result = await processLeadAutomation(lead());
    expect(result.salesSuite).toMatchObject({ success: true, contactId: "mock-contact", dealId: "mock-deal" });
    const calls = requests();
    expect(calls.every(r => r.url.startsWith("https://api.salessuite.com/api/"))).toBe(true);
    const contactRequest = calls.find(r => existing ? r.init?.method === "PATCH" : r.url.endsWith("/contact/create"))!;
    const contactBody = JSON.parse(contactRequest.body);
    const fields = existing ? contactBody : contactBody.contact;
    expect(fields.leadSource).toBe("Fast-Track Funnel: Selbstzahler");
    expect(fields).not.toHaveProperty("undefined");
    expect(Object.keys(fields).filter(k => k.startsWith("x_") && k !== "x_lead_erhalten_am")).toEqual([]);
    const deal = JSON.parse(calls.find(r => r.url.endsWith("/v2/deal"))!.body);
    expect(deal.name).toContain("Selbstzahler");
    const note = calls.find(r => r.url.includes("/v1/note?"))!.body;
    expect(note).toContain("Funnel: selbstzahler");
    expect(calls.map(r => r.body).join("\n")).not.toMatch(/traumwebseite|exit_plan|ki_report|download/);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining("custom field omitted for selbstzahler"));
  });

  it.each(["ki-report", "exit-plan", "traumwebseite"] as const)("preserves existing KlickTipp and Make routing for %s", async (funnel) => {
    const result = await processLeadAutomation(lead(funnel));
    expect(result.klicktipp.success).toBe(true);
    expect(result.makeWebhook.success).toBe(true);
    expect(requests().map(r => r.url)).toEqual(expect.arrayContaining([
      "https://api.klicktipp.com/subscriber/signin", `https://example.test/make/${funnel}`,
    ]));
  });
});
