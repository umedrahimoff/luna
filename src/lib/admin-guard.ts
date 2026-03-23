import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }
}
