import Link from "next/link";
import { adminCreateCategory } from "@/app/actions/admin-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { adminDetailFormCardClass } from "@/components/admin-entity-layout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string }> };

export default async function AdminNewCategoryPage({ searchParams }: Props) {
  const { e: error } = await searchParams;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/categories"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Categories
        </Link>
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight">
          New category
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Display name on the site; slug is generated automatically.
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

      <form
        action={adminCreateCategory}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={80}
            placeholder="e.g. Meetups"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Add
        </Button>
      </form>
    </div>
  );
}
