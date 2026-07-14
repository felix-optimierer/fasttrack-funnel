import { describe, it, expect } from "vitest";

describe("Make.com Webhook Validation", () => {
  it("MAKE_WEBHOOK_TRAUMWEBSEITE is set and reachable", async () => {
    const url = process.env.MAKE_WEBHOOK_TRAUMWEBSEITE;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/hook\..+\.make\.com\//);

    // Send a minimal test payload to verify the webhook is reachable
    const res = await fetch(url!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test: true, source: "vitest-validation" }),
    });

    // Make.com returns 200 when webhook is active
    expect(res.status).toBeLessThan(500);
  });
});
