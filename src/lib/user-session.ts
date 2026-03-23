import type { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { verifyUserSessionToken, USER_COOKIE } from "@/lib/user-token";
import { cookies } from "next/headers";

export type SessionUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  const userId = verifyUserSessionToken(token);
  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });
  return user;
}
