import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../db", () => ({ getDb: vi.fn() }));
import { getDb } from "../db";
import { CHANNELS, fireChannelWebhook, getChannelSeries, getFullFunnelStats, getFunnelStatsByChannel } from "../funnel-db";

function selectQueue(rows: unknown[][]) {
  return {
    select: vi.fn(() => {
      const result = rows.shift() ?? [];
      const chain: Record<string, any> = {};
      for (const method of ["from", "where", "orderBy"]) chain[method] = vi.fn(() => chain);
      chain.groupBy = vi.fn().mockResolvedValue(result);
      chain.limit = vi.fn().mockResolvedValue(result);
      return chain;
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("ok", { status: 200 })));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

const views = [{ page: "selbstzahler", count: 10 }, { page: "danke-selbstzahler", count: 90 }, { page: "traumwebseite", count: 20 }];
const leads = [{ source: "selbstzahler", count: 2 }, { source: "traumwebseite", count: 3 }, { source: "home", count: 1 }];
const range = { startDate: "2026-11-01", endDate: "2026-11-01" };

describe("Selbstzahler channel attribution", () => {
  it("includes its own zero-state channel without a database migration", async () => {
    vi.mocked(getDb).mockResolvedValue(null);
    expect(CHANNELS).toContain("selbstzahler");
    expect((await getFunnelStatsByChannel("day")).channels.find(c => c.channel === "selbstzahler")).toMatchObject({ visitors: 0, leads: 0 });
  });

  it("separates opt-ins and excludes thank-you views from LP conversion statistics", async () => {
    vi.mocked(getDb).mockResolvedValue(selectQueue([views, leads, [], []]) as any);
    const stats = await getFunnelStatsByChannel(range);
    expect(stats.channels.find(c => c.channel === "selbstzahler")).toMatchObject({ visitors: 10, leads: 2, lpCr: 0.2 });
    expect(stats.channels.find(c => c.channel === "traumwebseite")).toMatchObject({ visitors: 20, leads: 4 });
    expect(stats.totals).toMatchObject({ visitors: 30, leads: 6 });
  });

  it("uses the same independent attribution in the full funnel table", async () => {
    vi.mocked(getDb).mockResolvedValue(selectQueue([[], views, leads, []]) as any);
    const stats = await getFullFunnelStats(range);
    expect(stats.find(c => c.channel === "selbstzahler")).toMatchObject({ lpViews: 10, leads: 2, leadRate: 20 });
    expect(stats.find(c => c.channel === "traumwebseite")).toMatchObject({ lpViews: 20, leads: 4 });
  });

  it("includes independent daily series for Admin charts", async () => {
    const execute = vi.fn()
      .mockResolvedValueOnce([views.map(r => ({ ...r, day: "2026-11-01" }))])
      .mockResolvedValueOnce([leads.map(r => ({ ...r, day: "2026-11-01" }))])
      .mockResolvedValueOnce([[]]).mockResolvedValueOnce([[]]);
    vi.mocked(getDb).mockResolvedValue({ execute } as any);
    const points = await getChannelSeries(range);
    expect(points.find(c => c.channel === "selbstzahler")).toMatchObject({ visitors: 10, leads: 2, adSpendCents: 0 });
    expect(points.find(c => c.channel === "traumwebseite")).toMatchObject({ visitors: 20, leads: 4 });
  });
});

describe("Selbstzahler generic channel webhook (mocked destinations)", () => {
  it("uses its explicitly configured channel hook and preserves the source", async () => {
    vi.mocked(getDb).mockResolvedValue(selectQueue([[{ url: "https://example.test/own-hook", active: 1 }]]) as any);
    const payload = { source: "selbstzahler", event: "new_lead" };
    expect(await fireChannelWebhook("selbstzahler", payload)).toBe("sent");
    expect(fetch).toHaveBeenCalledWith("https://example.test/own-hook", expect.objectContaining({ body: JSON.stringify(payload) }));
  });

  it("may use an existing generic hook, without changing the source", async () => {
    vi.mocked(getDb).mockResolvedValue(selectQueue([[], [{ settingValue: "https://example.test/global-hook" }]]) as any);
    const payload = { source: "selbstzahler", event: "new_lead" };
    expect(await fireChannelWebhook("selbstzahler", payload)).toBe("sent");
    expect(fetch).toHaveBeenCalledWith("https://example.test/global-hook", expect.objectContaining({ body: JSON.stringify(payload) }));
  });

  it("does nothing if neither own nor generic hook is configured", async () => {
    vi.mocked(getDb).mockResolvedValue(selectQueue([[], []]) as any);
    expect(await fireChannelWebhook("selbstzahler", { source: "selbstzahler" })).toBe("none");
    expect(fetch).not.toHaveBeenCalled();
  });
});
