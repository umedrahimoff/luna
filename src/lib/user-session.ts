import { Prisma, type AppLanguage, type UserRole } from "@prisma/client";
import { cache } from "react";
import { db } from "@/lib/db";
import { verifyUserSessionToken, USER_COOKIE } from "@/lib/user-token";
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string | null;
  name: string;
  role: UserRole;
  username: string | null;
  avatarUrl: string | null;
  preferredLanguage: AppLanguage;
};

/**
 * Uses raw SQL so the app still runs if `npx prisma generate` is stale but the
 * DB already has newer columns (username, avatarUrl). `findUnique` + `select`
 * validates against the generated client and throws PrismaClientValidationError.
 */
async function loadSessionUserRow(userId: number): Promise<SessionUser | null> {
  try {
    const rows = await db.$queryRaw<
      Array<{
        id: number;
        email: string | null;
        name: string;
        role: string;
        username: string | null;
        avatarUrl: string | null;
        preferredLanguage: AppLanguage | null;
      }>
    >(
      Prisma.sql`SELECT "id", "email", "name", "role", "username", "avatarUrl", "preferredLanguage" FROM "User" WHERE "id" = ${userId} LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      username: row.username ?? null,
      avatarUrl: row.avatarUrl ?? null,
      preferredLanguage: row.preferredLanguage ?? "EN",
    };
  } catch {
    const rows = await db.$queryRaw<
      Array<{
        id: number;
        email: string | null;
        name: string;
        role: string;
      preferredLanguage: AppLanguage | null;
      }>
    >(
      Prisma.sql`SELECT "id", "email", "name", "role", "preferredLanguage" FROM "User" WHERE "id" = ${userId} LIMIT 1`,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role as UserRole,
      username: null,
      avatarUrl: null,
      preferredLanguage: row.preferredLanguage ?? "EN",
    };
  }
}

/**
 * Deduplicated per request: layout, metadata, and child components share one
 * DB read instead of repeating identical session queries (major TTFB win).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  const userId = verifyUserSessionToken(token);
  if (!userId) return null;
  return loadSessionUserRow(userId);
});
