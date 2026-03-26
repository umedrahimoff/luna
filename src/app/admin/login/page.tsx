import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaffContext } from "@/lib/staff-access";
import { buttonVariants } from "@/components/ui/button-variants";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Admin sign in",
  description: "Sign in to Luna administration panel.",
  path: "/admin/login",
  noIndex: true,
});

export default async function AdminLoginPage() {
  if (await getStaffContext()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-5 py-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Moderation panel
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Sign in with an account that has the{" "}
          <strong className="text-foreground">moderator</strong> or{" "}
          <strong className="text-foreground">administrator</strong> role.
          Roles are assigned under Admin → Users (administrators only).
        </p>
        <Link
          href="/login?next=/admin"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "mt-4 inline-flex",
          )}
        >
          Sign in via site
        </Link>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        There is no separate admin password. The first administrator must be
        promoted via <code className="text-foreground">LUNA_INITIAL_ADMIN_EMAIL</code>{" "}
        (see seed / env) or by editing the database.
      </p>
    </div>
  );
}
