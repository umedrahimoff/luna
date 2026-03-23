import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "luna_admin_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 дней

function secret(): string {
  return process.env.LUNA_ADMIN_SECRET ?? "";
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(): string | null {
  const s = secret();
  if (!s || s.length < 16) return null;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payloadB64 = Buffer.from(JSON.stringify({ exp }), "utf8").toString(
    "base64url",
  );
  const sig = signPayload(payloadB64);
  return `${payloadB64}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return false;
  const expected = signPayload(payloadB64);
  try {
    if (expected.length !== sig.length) return false;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return false;
  } catch {
    return false;
  }
  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const { exp } = JSON.parse(raw) as { exp?: number };
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

export async function isAdminSession(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSessionToken(jar.get(COOKIE)?.value);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export function adminAuthConfigured(): boolean {
  return Boolean(
    process.env.LUNA_ADMIN_SECRET &&
      process.env.LUNA_ADMIN_SECRET.length >= 16 &&
      process.env.LUNA_ADMIN_PASSWORD,
  );
}
