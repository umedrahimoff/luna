import Link from "next/link";
import { adminCreateCountry } from "@/app/actions/admin-references";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";
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

export default async function AdminNewCountryPage({ searchParams }: Props) {
  const { e: error } = await searchParams;

  return (
    <div className="flex w-full min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/countries"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Countries
        </Link>
      </div>
      <div>
        <h2 className="text-base font-semibold tracking-tight">New country</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Slug and ISO code are optional; you can set slug manually.
        </p>
      </div>

      {decodeErr(error) ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {decodeErr(error)}
        </p>
      ) : null}

      <ConfirmForm
        action={adminCreateCountry}
        confirmMessage={confirmMessages.createCountry}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            placeholder="e.g. Kazakhstan"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (optional)</Label>
          <Input
            id="slug"
            name="slug"
            maxLength={120}
            placeholder="kazakhstan"
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code2">ISO code (2 letters, optional)</Label>
          <Input
            id="code2"
            name="code2"
            maxLength={2}
            placeholder="KZ"
            className="font-mono uppercase"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Add
        </Button>
      </ConfirmForm>
    </div>
  );
}
