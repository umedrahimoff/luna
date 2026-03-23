import { requireAdminRole } from "@/lib/admin-guard";

export default async function AdminUsersSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminRole();
  return children;
}
