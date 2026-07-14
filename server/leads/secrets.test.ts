import { describe, it, expect } from "vitest";

describe("Lead Automation Secrets Validation", () => {
  it("SALESSUITE_API_KEY is set and authenticates successfully", async () => {
    const apiKey = process.env.SALESSUITE_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey!.length).toBeGreaterThan(10);

    const res = await fetch("https://api.salessuite.com/api/v1/auth", {
      headers: { "x-api-key": apiKey! },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tenantId).toBeTruthy();
    expect(data.name).toBe("Bewegungsoptimierer GmbH");
  });

  it("KLICKTIPP_API_KEY is set and has correct format", async () => {
    const apiKey = process.env.KLICKTIPP_API_KEY;
    expect(apiKey).toBeTruthy();
    expect(apiKey!.length).toBeGreaterThan(10);
    // KlickTipp API key is a hex string
    expect(apiKey).toMatch(/^[a-f0-9]+$/);
  });
});
