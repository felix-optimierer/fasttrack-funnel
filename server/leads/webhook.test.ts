import { describe, it, expect } from "vitest";

describe("Make.com Webhook Validation", () => {
  it("MAKE_WEBHOOK_TRAUMWEBSEITE is set and reachable", async () => {
    const url = process.env.MAKE_WEBHOOK_TRAUMWEBSEITE;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/hook\..+\.make\.com\//);

    const res = await fetch(url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, source: "vitest-validation" }),
    });

    expect(res.status).toBeLessThan(500);
  });

  it("MAKE_WEBHOOK_KI_REPORT is set and reachable", async () => {
    const url = process.env.MAKE_WEBHOOK_KI_REPORT;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/hook\..+\.make\.com\//);

    const res = await fetch(url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, source: "vitest-validation" }),
    });

    expect(res.status).toBeLessThan(500);
  });
});
