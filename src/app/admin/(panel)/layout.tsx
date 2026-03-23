import { UserRole } from "@prisma/client";
import { AdminPanelShell } from "@/components/admin-panel-shell";
import { requireStaff } from "@/lib/admin-guard";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  const canManageUsers = staff.role === UserRole.ADMIN;

  return (
    <AdminPanelShell canManageUsers={canManageUsers}>{children}</AdminPanelShell>
  );
}
