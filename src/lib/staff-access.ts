import { UserRole } from "@prisma/client";
import { getSessionUser } from "@/lib/user-session";

/** Moderator or administrator — /admin, edit any event, etc. */
export function isStaffRole(role: UserRole): boolean {
  return role === UserRole.MODERATOR || role === UserRole.ADMIN;
}

/** Signed-in moderator or administrator. */
export async function isStaffAccess(): Promise<boolean> {
  const u = await getSessionUser();
  return u != null && isStaffRole(u.role);
}

/** User management: administrator role only. */
export async function isAdminRoleAccess(): Promise<boolean> {
  const u = await getSessionUser();
  return u != null && u.role === UserRole.ADMIN;
}

export type StaffContext = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export async function getStaffContext(): Promise<StaffContext | null> {
  const u = await getSessionUser();
  if (!u || !isStaffRole(u.role)) return null;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
  };
}
