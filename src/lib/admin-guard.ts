import { redirect } from "next/navigation";
import {
  getStaffContext,
  isAdminRoleAccess,
  type StaffContext,
} from "@/lib/staff-access";

export type { StaffContext };

/** /admin access: moderator or administrator. */
export async function requireStaff(): Promise<StaffContext> {
  const ctx = await getStaffContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

/** User and role management — administrator only. */
export async function requireAdminRole(): Promise<void> {
  if (!(await isAdminRoleAccess())) {
    redirect(
      `/admin?e=${encodeURIComponent("Administrator access required")}`,
    );
  }
}
