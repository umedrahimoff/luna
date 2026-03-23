import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminDeleteCity } from "@/app/actions/admin-references";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { normalizeAdminListQuery } from "@/lib/admin-list-queries";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ e?: string; q?: string }>;
};

function decodeErr(e?: string) {
  if (!e) return null;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

export default async function AdminCitiesPage({ searchParams }: Props) {
  const { e: error, q: rawQ } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);

  const where: Prisma.CityWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { country: { name: { contains: q } } },
        ],
      }
    : undefined;

  const cities = await db.city.findMany({
    where,
    orderBy: [{ country: { name: "asc" } }, { name: "asc" }],
    include: { country: true },
  });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Admin
        </Link>
        <Link
          href="/admin/references/categories"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Categories
        </Link>
        <Link
          href="/admin/references/countries"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Countries
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Cities</h2>
        <Link
          href="/admin/references/cities/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          Add
        </Link>
      </div>

      {decodeErr(error) ? (
        <p className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
          {decodeErr(error)}
        </p>
      ) : null}

      <AdminListToolbar
        action="/admin/references/cities"
        defaultQuery={q}
        placeholder="City, slug, or country name"
        resetHref="/admin/references/cities"
        showReset={Boolean(q)}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">City</th>
              <th className="p-2.5 font-medium">Slug</th>
              <th className="p-2.5 font-medium">Country</th>
              <th className="text-muted-foreground min-w-[5rem] whitespace-nowrap p-2.5 text-right text-xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-b last:border-0">
                <td className="p-2.5 font-medium">
                  <Link
                    href={`/admin/references/cities/${city.id}`}
                    className="text-primary hover:underline"
                  >
                    {city.name}
                  </Link>
                </td>
                <td className="text-muted-foreground p-2.5 font-mono text-xs">
                  {city.slug}
                </td>
                <td className="p-2.5">
                  <Link
                    href={`/admin/references/countries/${city.countryId}`}
                    className="text-primary hover:underline"
                  >
                    {city.country.name}
                  </Link>
                </td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="flex flex-row flex-nowrap items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/references/cities/${city.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Edit"
                      aria-label={`Edit city “${city.name}”`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ConfirmForm
                      action={adminDeleteCity.bind(null, city.id)}
                      confirmMessage={confirmMessages.deleteCity}
                      className="inline-flex shrink-0"
                    >
                      <button
                        type="submit"
                        className={cn(
                          buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          }),
                          "text-destructive hover:bg-destructive/10 hover:text-destructive",
                        )}
                        title="Delete city"
                        aria-label={`Delete city “${city.name}”`}
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
      {cities.length === 0 && q ? (
        <p className="text-muted-foreground text-sm">
          Nothing found — try a different search.
        </p>
      ) : null}
    </div>
  );
}
