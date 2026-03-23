import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import { adminUpdateUser } from "@/app/actions/admin-users";
import { AdminEntityLayout } from "@/components/admin-entity-layout";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminTechnicalAside } from "@/components/admin-technical-aside";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { formatAdminEntityDateTime } from "@/lib/admin-entity-meta";
import { userRoleLabel } from "@/lib/role-labels";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { parseRecordId } from "@/lib/record-id";

export const dynamic = "force-dynamic";

const NOTE_AUDIT =
  "Who created the account in admin or via signup is not stored separately. Last editor is not recorded.";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
};

export default async function AdminEditUserPage({ params, searchParams }: Props) {
  const { id: idRaw } = await params;
  const id = parseRecordId(idRaw);
  if (id == null) notFound();
  const { e: error } = await searchParams;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { events: true } },
    },
  });
  if (!user) notFound();

  const action = adminUpdateUser.bind(null, user.id);

  const formCardClass =
    "bg-card grid w-full min-w-0 grid-cols-1 gap-4 rounded-xl border p-4 ring-1 ring-black/5 sm:grid-cols-2";
  const fieldShell = "min-w-0 space-y-2";
  const span2 = "sm:col-span-2";

  const main = (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/users"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            ← Users
          </Link>
        </div>
        <h2 className="text-base font-semibold tracking-tight">Edit user</h2>
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

      <ConfirmForm action={action} confirmMessage={confirmMessages.save} className={formCardClass}>
        <div className={fieldShell}>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            defaultValue={user.name}
          />
        </div>
        <div className={fieldShell}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={user.email}
          />
        </div>
        <div className={fieldShell}>
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            required
            defaultValue={user.role}
            className={cn(
              "border-input bg-background min-h-10 w-full rounded-lg border px-3 py-2 text-sm shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
            )}
          >
            {[UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN].map((r) => (
              <option key={r} value={r}>
                {userRoleLabel(r)}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-xs leading-relaxed">
            User — signup and own events. Moderator — panel without the Users
            section. Administrator — full access.
          </p>
        </div>
        <div className={fieldShell}>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Do not change"
          />
          <p className="text-muted-foreground text-xs leading-relaxed">
            Leave empty to keep the current password.
          </p>
        </div>
        <div className={cn("flex justify-end", span2)}>
          <Button type="submit" className="min-w-32 shrink-0">
            Save
          </Button>
        </div>
      </ConfirmForm>
    </div>
  );

  const aside = (
    <AdminTechnicalAside
      fields={[
        { label: "ID", value: user.id, mono: true },
        {
          label: "Created",
          value: formatAdminEntityDateTime(user.createdAt),
        },
        {
          label: "Updated",
          value: formatAdminEntityDateTime(user.updatedAt),
        },
        {
          label: "Events",
          value: String(user._count.events),
        },
        {
          label: "Role",
          value: userRoleLabel(user.role),
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
