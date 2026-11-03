import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "../_core/context";

vi.mock("../funnel-db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../funnel-db")>();
  return {
    ...actual,
    checkDuplicate: vi.fn(), insertLead: vi.fn(), fireChannelWebhook: vi.fn(),
    updateLeadWebhookStatus: vi.fn(), insertPageView: vi.fn(), insertAppointment: vi.fn(),
    getWebhookByChannel: vi.fn(), setWebhookByChannel: vi.fn(), listLeadsEnhanced: vi.fn(),
  };
});
vi.mock("./automation", () => ({ processLeadAutomation: vi.fn() }));
vi.mock("../_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
vi.mock("../admin-auth", () => ({
  ADMIN_COOKIE: "mock-admin", isAdminRequest: vi.fn().mockResolvedValue(true),
  createAdminToken: vi.fn(), validateAdminCredentials: vi.fn(),
}));

import { appRouter } from "../routers";
import * as db from "../funnel-db";
import { processLeadAutomation } from "./automation";
import { notifyOwner } from "../_core/notification";
import { isAdminRequest } from "../admin-auth";

const caller = () => appRouter.createCaller({
  user: null, req: { headers: {}, socket: { remoteAddress: "127.0.0.1" } }, res: {},
} as TrpcContext);
const input = { name: "Anna Test", email: "anna@example.test", phone: "017612345678", source: "selbstzahler" };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(notifyOwner).mockResolvedValue(true);
  vi.mocked(isAdminRequest).mockResolvedValue(true);
  vi.mocked(db.checkDuplicate).mockResolvedValue(false);
  vi.mocked(db.insertLead).mockResolvedValue(42);
  vi.mocked(db.fireChannelWebhook).mockResolvedValue("none");
  vi.mocked(db.getWebhookByChannel).mockResolvedValue(null);
  vi.mocked(processLeadAutomation).mockResolvedValue({
    klicktipp: { success: false, skipped: true }, salesSuite: { success: true },
    makeWebhook: { success: false, skipped: true },
  });
  // Fail closed if any unmocked path attempts an external request.
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Unexpected external request")));
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("Selbstzahler router mappings", () => {
  it("stores, forwards and automates as selbstzahler, not the old Traumwebseite fallback", async () => {
    expect(await caller().leads.create(input)).toMatchObject({ success: true, id: 42 });
    expect(db.insertLead).toHaveBeenCalledWith(expect.objectContaining({ source: "selbstzahler" }));
    expect(db.fireChannelWebhook).toHaveBeenCalledWith("selbstzahler", expect.objectContaining({ source: "selbstzahler" }));
    expect(processLeadAutomation).toHaveBeenCalledWith(expect.objectContaining({
      source: "selbstzahler", funnel: "selbstzahler", firstName: "Anna", lastName: "Test",
    }));
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects a missing DB insert and never sends webhooks, owner notification or automation", async () => {
    vi.mocked(db.insertLead).mockResolvedValue(null);
    await expect(caller().leads.create(input)).rejects.toMatchObject({
      code: "INTERNAL_SERVER_ERROR",
      message: "Deine Anfrage konnte gerade nicht gespeichert werden. Bitte versuche es später erneut.",
    });
    expect(db.fireChannelWebhook).not.toHaveBeenCalled();
    expect(db.updateLeadWebhookStatus).not.toHaveBeenCalled();
    expect(notifyOwner).not.toHaveBeenCalled();
    expect(processLeadAutomation).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps duplicate handling and does not run duplicate automation", async () => {
    vi.mocked(db.checkDuplicate).mockResolvedValue(true);
    expect(await caller().leads.create(input)).toMatchObject({ isDuplicate: true });
    expect(processLeadAutomation).not.toHaveBeenCalled();
  });

  it.each(["selbstzahler", "danke-selbstzahler"] as const)("accepts page view %s unchanged", async (page) => {
    expect(await caller().tracking.pageView({ page })).toEqual({ success: true });
    expect(db.insertPageView).toHaveBeenCalledWith(expect.objectContaining({ page }));
  });

  it("supports its own admin webhook get/set/test channel and source filter", async () => {
    const api = caller();
    expect(await api.admin.getWebhook({ channel: "selbstzahler" })).toEqual({ url: "", active: true });
    expect(db.getWebhookByChannel).toHaveBeenCalledWith("selbstzahler");
    await api.admin.setWebhook({ channel: "selbstzahler", url: "https://example.test/hook" });
    expect(db.setWebhookByChannel).toHaveBeenCalledWith("selbstzahler", "https://example.test/hook", true);
    await api.admin.testWebhook({ channel: "selbstzahler" });
    expect(db.fireChannelWebhook).toHaveBeenCalledWith("selbstzahler", expect.objectContaining({ channel: "selbstzahler", event: "test" }));
    await api.admin.leadsEnhanced({ source: "selbstzahler" });
    expect(db.listLeadsEnhanced).toHaveBeenCalledWith({ source: "selbstzahler" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("accepts own appointment source without adding a new booking integration", async () => {
    await caller().appointments.create({ source: "selbstzahler", email: input.email });
    expect(db.insertAppointment).toHaveBeenCalledWith(expect.objectContaining({ source: "selbstzahler" }));
  });

  it("retains legacy home mapping but skips unrecognized sources instead of misassigning another funnel", async () => {
    await caller().leads.create({ ...input, source: "home" });
    expect(processLeadAutomation).toHaveBeenCalledWith(expect.objectContaining({ source: "home", funnel: "traumwebseite" }));
    vi.mocked(processLeadAutomation).mockClear();
    await caller().leads.create({ ...input, source: "unknown-funnel" });
    expect(processLeadAutomation).not.toHaveBeenCalled();
    expect(db.insertLead).toHaveBeenLastCalledWith(expect.objectContaining({ source: "unknown-funnel" }));
  });
});
