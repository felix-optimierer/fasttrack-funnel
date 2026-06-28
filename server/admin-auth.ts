import { SignJWT, jwtVerify } from "jose";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { ENV } from "./_core/env";

/**
 * Eigenes, einfaches Admin-Login (Passwort-basiert), getrennt vom Manus-OAuth.
 * Zugang: feste E-Mail + Passwort. Session über signiertes JWT im Cookie.
 */
export const ADMIN_EMAIL = "felix@onboarding-prozesse.de";
export const ADMIN_PASSWORD = "Pi.Fun926535";
export const ADMIN_COOKIE = "ft_admin";

const secret = new TextEncoder().encode(
  ENV.cookieSecret || "fast-track-admin-fallback-secret",
);

export async function createAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload?.email === ADMIN_EMAIL && payload?.role === "admin";
  } catch {
    return false;
  }
}

/** Liest das Admin-Cookie aus dem Request und prüft die Gültigkeit. */
export async function isAdminRequest(
  req: CreateExpressContextOptions["req"],
): Promise<boolean> {
  const header = req.headers?.cookie ?? "";
  const match = header
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`));
  if (!match) return false;
  const token = decodeURIComponent(match.slice(ADMIN_COOKIE.length + 1));
  if (!token) return false;
  return verifyAdminToken(token);
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
