"use server";

import { redirect } from "next/navigation";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import { clearUserSessionCookie } from "@/lib/user-token";

/** Leave admin panel and end the site session (staff is tied to the user account). */
export async function adminLogout(): Promise<void> {
  await clearAdminSessionCookie();
  await clearUserSessionCookie();
  redirect("/admin/login");
}
