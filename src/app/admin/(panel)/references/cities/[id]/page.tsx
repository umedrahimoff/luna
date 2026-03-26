import Link from "next/link";
import { notFound } from "next/navigation";
import { adminDeleteCity, adminUpdateCity } from "@/app/actions/admin-references";
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
  "City is linked to a country (Restrict). Changing country updates the link.";

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

export default async function AdminCityDetailPage({
  params,
  searchParams,
}: Props) {
  const { id: idRaw } = await params;
  const id = parseRecordId(idRaw);
  if (id == null) notFound();
  const { e: error } = await searchParams;
  const city = await db.city.findUnique({
    where: { id },
    include: { country: true },
  });
  if (!city) notFound();

  const countries = await db.country.findMany({ orderBy: { nameEn: "asc" } });

  const main = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/references/cities"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Cities
        </Link>
        <Link
          href={`/admin/references/countries/${city.countryId}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Country
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
        <h2 className="text-base font-semibold tracking-tight">{city.name}</h2>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          {city.slug}
        </p>
      </div>

      <ConfirmForm
        action={adminUpdateCity.bind(null, city.id)}
        confirmMessage={confirmMessages.save}
        className={adminDetailFormCardClass}
      >
        <div className="space-y-2">
          <Label htmlFor="countryId">Country</Label>
          <select
            id="countryId"
            name="countryId"
            required
            defaultValue={city.countryId}
            className="border-input bg-background h-10 w-full rounded-lg border px-3 text-sm"
          >
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameEn ?? c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameEn">Name (EN)</Label>
          <Input
            id="nameEn"
            name="nameEn"
            required
            maxLength={120}
            defaultValue={city.nameEn ?? city.name}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nameRu">Name (RU)</Label>
          <Input
            id="nameRu"
            name="nameRu"
            required
            maxLength={120}
            defaultValue={city.nameRu ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input
            id="slug"
            name="slug"
            maxLength={120}
            defaultValue={city.slug}
            className="font-mono text-xs"
          />
        </div>
        <Button type="submit" className="w-full sm:w-auto">
          Save
        </Button>
      </ConfirmForm>

      <div className="border-t pt-4">
        <ConfirmForm
          action={adminDeleteCity.bind(null, city.id)}
          confirmMessage={confirmMessages.deleteCity}
        >
          <Button type="submit" variant="destructive" size="sm">
            Delete city
          </Button>
        </ConfirmForm>
      </div>
    </>
  );

  const aside = (
    <AdminTechnicalAside
      fields={[
        { label: "ID", value: city.id, mono: true },
        { label: "Slug", value: city.slug, mono: true },
        {
          label: "Country",
          value: `${city.country.nameEn ?? city.country.name} (${city.country.slug})`,
        },
        {
          label: "Created",
          value: formatAdminEntityDateTime(city.createdAt),
        },
        {
          label: "Updated",
          value: formatAdminEntityDateTime(city.updatedAt),
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
