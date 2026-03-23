import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export const USER_COOKIE = "luna_user_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.LUNA_SESSION_SECRET ?? "";
}

function signPayload(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function createUserSessionToken(userId: number): string | null {
  const s = secret();
  if (!s || s.length < 16) return null;
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payloadB64 = Buffer.from(
    JSON.stringify({ userId, exp }),
    "utf8",
  ).toString("base64url");
  return `${payloadB64}.${signPayload(payloadB64)}`;
}

export function verifyUserSessionToken(
  token: string | undefined,
): number | null {
  if (!token || !secret()) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  if (!payloadB64 || !sig) return null;
  const expected = signPayload(payloadB64);
  try {
    if (expected.length !== sig.length) return null;
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  } catch {
    return null;
  }
  try {
    const raw = Buffer.from(payloadB64, "base64url").toString("utf8");
    const { userId, exp } = JSON.parse(raw) as {
      userId?: number | string;
      exp?: number;
    };
    if (typeof exp !== "number" || exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    if (typeof userId === "number" && Number.isInteger(userId) && userId >= 1) {
      return userId;
    }
    if (typeof userId === "string" && /^\d+$/.test(userId)) {
      const n = Number.parseInt(userId, 10);
      return Number.isInteger(n) && n >= 1 ? n : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function userSessionConfigured(): boolean {
  return Boolean(secret() && secret().length >= 16);
}

export async function setUserSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });
}

export async function clearUserSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(USER_COOKIE);
}
