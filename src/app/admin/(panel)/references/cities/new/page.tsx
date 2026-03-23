import Link from "next/link";
import { adminCreateCity } from "@/app/actions/admin-references";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
import { db } from "@/lib/db";
import { adminDetailFormCardClass } from "@/components/admin-entity-layout";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string }> };

function decodeErr(e?: string) {
  if (!e) return null;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

export default async function AdminNewCityPage({ searchParams }: Props) {
  const { e: error } = await searchParams;
  const countries = await db.country.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/cities"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Cities
        </Link>
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight">New city</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          City is linked to a country; slug is optional.
        </p>
      </div>

      {decodeErr(error) ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {decodeErr(error)}
        </p>
      ) : null}

      <form
        action={adminCreateCity}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="countryId">Country</Label>
          <select
            id="countryId"
            name="countryId"
            required
            defaultValue=""
            className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
          >
            <option value="" disabled>
              Select country
            </option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            placeholder="e.g. Almaty"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            name="slug"
            maxLength={120}
            placeholder="almaty"
            className="font-mono text-xs"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Add
        </Button>
      </form>
    </div>
  );
}
