import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { adminDeleteCountry } from "@/app/actions/admin-references";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { normalizeAdminListQuery } from "@/lib/admin-list-queries";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string; q?: string }> };

function decodeErr(e?: string) {
  if (!e) return null;
  try {
    return decodeURIComponent(e);
  } catch {
    return e;
  }
}

export default async function AdminCountriesPage({ searchParams }: Props) {
  const { e: error, q: rawQ } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);
  const where: Prisma.CountryWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { code2: { contains: q } },
        ],
      }
    : undefined;

  const countries = await db.country.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { cities: true } } },
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
          href="/admin/references/cities"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Cities
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Countries</h2>
        <Link
          href="/admin/references/countries/new"
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
        action="/admin/references/countries"
        defaultQuery={q}
        placeholder="Name, slug, or ISO"
        resetHref="/admin/references/countries"
        showReset={Boolean(q)}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Name</th>
              <th className="p-2.5 font-medium">Slug</th>
              <th className="p-2.5 font-medium">ISO</th>
              <th className="p-2.5 font-medium">Cities</th>
              <th className="text-muted-foreground min-w-[5rem] whitespace-nowrap p-2.5 text-right text-xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {countries.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-2.5 font-medium">
                  <Link
                    href={`/admin/references/countries/${c.id}`}
                    className="text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="text-muted-foreground p-2.5 font-mono text-xs">
                  {c.slug}
                </td>
                <td className="text-muted-foreground p-2.5 font-mono text-xs">
                  {c.code2 ?? "—"}
                </td>
                <td className="p-2.5 tabular-nums">{c._count.cities}</td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="flex flex-row flex-nowrap items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/references/countries/${c.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Edit"
                      aria-label={`Edit country “${c.name}”`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ConfirmForm
                      action={adminDeleteCountry.bind(null, c.id)}
                      confirmMessage={confirmMessages.deleteCountry}
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
                        title="Delete country"
                        aria-label={`Delete country “${c.name}”`}
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
      {countries.length === 0 && q ? (
        <p className="text-muted-foreground text-sm">
          Nothing found — try a different search.
        </p>
      ) : null}
    </div>
  );
}
