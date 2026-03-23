import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminDeleteCountryFromDetail,
  adminUpdateCountry,
} from "@/app/actions/admin-references";
import {
  AdminEntityLayout,
  adminDetailFormCardClass,
} from "@/components/admin-entity-layout";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminTechnicalAside } from "@/components/admin-technical-aside";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatAdminEntityDateTime } from "@/lib/admin-entity-meta";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { parseRecordId } from "@/lib/record-id";

export const dynamic = "force-dynamic";

const NOTE_AUDIT =
  "Reference data; row author is not stored. Delete only when there are no cities.";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ e?: string }>;
};

function decodeErr(e?: string) {
  if (!e) return null;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

export default async function AdminCountryDetailPage({
  params,
  searchParams,
}: Props) {
  const { id: idRaw } = await params;
  const id = parseRecordId(idRaw);
  if (id == null) notFound();
  const { e: error } = await searchParams;
  const country = await db.country.findUnique({
    where: { id },
    include: {
      _count: { select: { cities: true } },
      cities: { orderBy: { name: "asc" } },
    },
  });
  if (!country) notFound();

  const canDelete = country._count.cities === 0;

  const main = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/countries"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Countries
        </Link>
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Admin
        </Link>
      </div>

      {decodeErr(error) ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {decodeErr(error)}
        </p>
      ) : null}

      <div>
        <h2 className="text-base font-semibold tracking-tight">
          {country.name}
        </h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {country.slug}
          {country.code2 ? ` · ${country.code2}` : ""}
        </p>
      </div>

      <ConfirmForm
        action={adminUpdateCountry.bind(null, country.id)}
        confirmMessage={confirmMessages.save}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            required
            maxLength={120}
            defaultValue={country.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            maxLength={120}
            defaultValue={country.slug}
            className="font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="code2">ISO code (2 letters or empty)</Label>
          <Input
            id="code2"
            name="code2"
            maxLength={2}
            defaultValue={country.code2 ?? ""}
            className="font-mono uppercase"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Save
        </Button>
      </ConfirmForm>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">
          Cities ({country._count.cities})
        </h3>
        {country.cities.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No cities.{" "}
            <Link
              href="/admin/references/cities"
              className="text-primary underline"
            >
              Add from the cities list
            </Link>
            .
          </p>
        ) : (
          <ul className="text-sm">
            {country.cities.map((city) => (
              <li key={city.id}>
                <Link
                  href={`/admin/references/cities/${city.id}`}
                  className="text-primary hover:underline"
                >
                  {city.name}
                </Link>
                <span className="text-muted-foreground ml-1 font-mono text-xs">
                  {city.slug}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t pt-4">
        <ConfirmForm
          action={adminDeleteCountryFromDetail.bind(null, country.id)}
          confirmMessage={confirmMessages.deleteCountry}
        >
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            disabled={!canDelete}
            title={
              canDelete
                ? "Delete country"
                : "Remove or reassign cities first"
            }
          >
            Delete country
          </Button>
        </ConfirmForm>
        {!canDelete ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Deletion is blocked while cities exist.
          </p>
        ) : null}
      </div>
    </>
  );

  const aside = (
    <AdminTechnicalAside
      fields={[
        { label: "ID", value: country.id, mono: true },
        { label: "Slug", value: country.slug, mono: true },
        {
          label: "ISO",
          value: country.code2 ?? "—",
          mono: true,
        },
        {
          label: "Created",
          value: formatAdminEntityDateTime(country.createdAt),
        },
        {
          label: "Updated",
          value: formatAdminEntityDateTime(country.updatedAt),
        },
        {
          label: "Cities",
          value: String(country._count.cities),
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
