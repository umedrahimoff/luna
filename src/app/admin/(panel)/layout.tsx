import { AdminPanelShell } from "@/components/admin-panel-shell";
import { requireAdmin } from "@/lib/admin-guard";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return <AdminPanelShell>{children}</AdminPanelShell>;
}
