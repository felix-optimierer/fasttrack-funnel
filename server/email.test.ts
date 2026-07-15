import { describe, it, expect } from "vitest";
import { verifyResendApiKey } from "./email";

describe("Resend API Key Validation", () => {
  it("RESEND_API_KEY is set and has correct format", () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY!.length).toBeGreaterThan(10);
    expect(process.env.RESEND_API_KEY!.startsWith("re_")).toBe(true);
  });

  it("RESEND_API_KEY is valid and can authenticate", async () => {
    const result = await verifyResendApiKey();
    expect(result.valid).toBe(true);
  }, 10000);
});
