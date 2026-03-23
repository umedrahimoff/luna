import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { adminDeleteCategory } from "@/app/actions/admin-references";
import { ConfirmForm } from "@/components/confirm-form";
import { confirmMessages } from "@/lib/confirm-messages";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { normalizeAdminListQuery } from "@/lib/admin-list-queries";
import { cn } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ e?: string; q?: string }> };

export default async function AdminCategoriesPage({ searchParams }: Props) {
  const { e: error, q: rawQ } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);
  const where: Prisma.CategoryWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
        ],
      }
    : undefined;

  const categories = await db.category.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { events: true } } },
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
          href="/admin/references/countries"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Countries
        </Link>
        <Link
          href="/admin/references/cities"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Cities
        </Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight">Categories</h2>
        <Link
          href="/admin/references/categories/new"
          className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          Add
        </Link>
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

      <AdminListToolbar
        action="/admin/references/categories"
        defaultQuery={q}
        placeholder="Name or slug"
        resetHref="/admin/references/categories"
        showReset={Boolean(q)}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Name</th>
              <th className="p-2.5 font-medium">Slug</th>
              <th className="p-2.5 font-medium">Events</th>
              <th className="text-muted-foreground min-w-[5rem] whitespace-nowrap p-2.5 text-right text-xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-2.5 font-medium">
                  <Link
                    href={`/admin/references/categories/${c.id}`}
                    className="text-primary hover:underline"
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="text-muted-foreground p-2.5 font-mono text-xs">
                  {c.slug}
                </td>
                <td className="p-2.5 tabular-nums">{c._count.events}</td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="flex flex-row flex-nowrap items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/references/categories/${c.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Edit"
                      aria-label={`Edit category “${c.name}”`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <ConfirmForm
                      action={adminDeleteCategory.bind(null, c.id)}
                      confirmMessage={confirmMessages.deleteCategory}
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
                        title="Delete category"
                        aria-label={`Delete category “${c.name}”`}
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
      {categories.length === 0 && q ? (
        <p className="text-muted-foreground text-sm">
          Nothing found — try a different search.
        </p>
      ) : null}
    </div>
  );
}
