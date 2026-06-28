import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import {
  ADMIN_COOKIE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  createAdminToken,
  validateAdminCredentials,
  verifyAdminToken,
} from "./admin-auth";
import type { TrpcContext } from "./_core/context";

type CookieSet = { name: string; value: string; options: Record<string, unknown> };

function createCtx(cookieHeader = ""): {
  ctx: TrpcContext;
  setCookies: CookieSet[];
  clearedCookies: { name: string }[];
} {
  const setCookies: CookieSet[] = [];
  const clearedCookies: { name: string }[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: { cookie: cookieHeader },
    } as unknown as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: (name: string) => {
        clearedCookies.push({ name });
      },
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies, clearedCookies };
}

describe("admin-auth helpers", () => {
  it("validates only the correct credentials", () => {
    expect(validateAdminCredentials(ADMIN_EMAIL, ADMIN_PASSWORD)).toBe(true);
    expect(validateAdminCredentials(ADMIN_EMAIL.toUpperCase(), ADMIN_PASSWORD)).toBe(true);
    expect(validateAdminCredentials(ADMIN_EMAIL, "wrong")).toBe(false);
    expect(validateAdminCredentials("other@x.de", ADMIN_PASSWORD)).toBe(false);
  });

  it("creates a token that verifies and rejects garbage", async () => {
    const token = await createAdminToken(ADMIN_EMAIL);
    expect(await verifyAdminToken(token)).toBe(true);
    expect(await verifyAdminToken("not-a-token")).toBe(false);
  });
});

describe("admin router", () => {
  it("rejects login with wrong password", async () => {
    const { ctx, setCookies } = createCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.login({ email: ADMIN_EMAIL, password: "falsch" }),
    ).rejects.toThrow();
    expect(setCookies).toHaveLength(0);
  });

  it("sets a secure admin cookie on successful login", async () => {
    const { ctx, setCookies } = createCtx();
    const caller = appRouter.createCaller(ctx);
    const res = await caller.admin.login({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(res).toEqual({ success: true });
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0].name).toBe(ADMIN_COOKIE);
    expect(setCookies[0].options).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });

  it("admin.me returns false without cookie and true with valid cookie", async () => {
    const anon = createCtx();
    const anonCaller = appRouter.createCaller(anon.ctx);
    expect(await anonCaller.admin.me()).toEqual({ isAdmin: false });

    const token = await createAdminToken(ADMIN_EMAIL);
    const authed = createCtx(`${ADMIN_COOKIE}=${token}`);
    const authedCaller = appRouter.createCaller(authed.ctx);
    expect(await authedCaller.admin.me()).toEqual({ isAdmin: true });
  });

  it("protects stats/leads against unauthenticated access", async () => {
    const { ctx } = createCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.stats({ period: "day" })).rejects.toThrow();
    await expect(caller.admin.leads()).rejects.toThrow();
    await expect(caller.admin.getWebhook()).rejects.toThrow();
  });

  it("clears the admin cookie on logout", async () => {
    const { ctx, clearedCookies } = createCtx();
    const caller = appRouter.createCaller(ctx);
    const res = await caller.admin.logout();
    expect(res).toEqual({ success: true });
    expect(clearedCookies.some((c) => c.name === ADMIN_COOKIE)).toBe(true);
  });
});
