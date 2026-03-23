import Link from "next/link";
import { UserRole } from "@prisma/client";
import { adminCreateUser } from "@/app/actions/admin-users";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { userRoleLabel } from "@/lib/role-labels";
import { adminDetailFormCardClassComfortable } from "@/components/admin-entity-layout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string }> };

export default async function AdminNewUserPage({ searchParams }: Props) {
  const { e: error } = await searchParams;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/users"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Users
        </Link>
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          New user
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Password must be at least 8 characters. They can sign in immediately.
        </p>
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

      <ConfirmForm
        action={adminCreateUser}
        confirmMessage={confirmMessages.createUser}
        className={adminDetailFormCardClassComfortable}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required maxLength={120} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            required
            defaultValue={UserRole.USER}
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Create
        </Button>
      </ConfirmForm>
    </div>
  );
}
