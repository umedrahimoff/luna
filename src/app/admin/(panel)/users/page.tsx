import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { userRoleLabel } from "@/lib/role-labels";
import { adminDeleteUser } from "@/app/actions/admin-users";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Label } from "@/components/ui/label";
import {
  normalizeAdminListQuery,
  userListWhere,
} from "@/lib/admin-list-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ e?: string; q?: string; role?: string }>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const { e: error, q: rawQ, role: roleFilter } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);
  const role = roleFilter ?? "";

  const users = await db.user.findMany({
    where: userListWhere({ q, role }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { events: true } },
    },
  });

  const hasFilters = Boolean(q || role);

  const filters = (
    <div className="flex min-w-[9rem] flex-col gap-1.5">
      <Label htmlFor="filter-role" className="text-xs">
        Role
      </Label>
      <select
        id="filter-role"
        name="role"
        defaultValue={role}
        className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
      >
        <option value="">All roles</option>
        <option value={UserRole.USER}>{userRoleLabel(UserRole.USER)}</option>
        <option value={UserRole.MODERATOR}>
          {userRoleLabel(UserRole.MODERATOR)}
        </option>
        <option value={UserRole.ADMIN}>{userRoleLabel(UserRole.ADMIN)}</option>
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Users</h2>
        <Link
          href="/admin/users/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          Add
        </Link>
      </div>

      {error ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {(() => {
            try {
              return decodeURIComponent(error);
            } catch {
              return error;
            }
          })()}
        </p>
      ) : null}

      <AdminListToolbar
        action="/admin/users"
        defaultQuery={q}
        placeholder="Name or email"
        filters={filters}
        resetHref="/admin/users"
        showReset={hasFilters}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Name</th>
              <th className="p-2.5 font-medium">Email</th>
              <th className="p-2.5 font-medium">Role</th>
              <th className="p-2.5 font-medium">Events</th>
              <th className="p-2.5 font-medium">Joined</th>
              <th className="text-muted-foreground min-w-[5.5rem] whitespace-nowrap p-2.5 text-right text-xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="p-2.5 font-medium">{u.name}</td>
                <td className="text-muted-foreground p-2.5">
                  <a href={`mailto:${u.email}`} className="hover:underline">
                    {u.email}
                  </a>
                </td>
                <td className="p-2.5">{userRoleLabel(u.role)}</td>
                <td className="p-2.5 tabular-nums">{u._count.events}</td>
                <td className="text-muted-foreground p-2.5 tabular-nums">
                  {u.createdAt.toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="flex flex-row flex-nowrap items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Edit"
                      aria-label={`Edit user ${u.name}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ConfirmForm
                      action={adminDeleteUser.bind(null, u.id)}
                      confirmMessage={confirmMessages.deleteUser}
                      className="inline-flex shrink-0"
                    >
                      <button
                        type="submit"
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          }),
                          u._count.events > 0
                            ? "pointer-events-none opacity-40"
                            : "text-destructive hover:bg-destructive/10 hover:text-destructive",
                        )}
                        title={
                          u._count.events > 0
                            ? "Delete the user’s events first"
                            : "Delete"
                        }
                        aria-label={`Delete user ${u.name}`}
                        disabled={u._count.events > 0}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {hasFilters
            ? "No users found — adjust filters or search."
            : "No users yet."}
        </p>
      )}
    </div>
  );
}
