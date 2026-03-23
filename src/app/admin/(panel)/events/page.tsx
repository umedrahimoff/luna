import Link from "next/link";
import { Pencil, Trash2, Users } from "lucide-react";
import { db } from "@/lib/db";
import { adminDeleteEvent } from "@/app/actions/admin-data";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { Label } from "@/components/ui/label";
import {
  eventListWhere,
  normalizeAdminListQuery,
} from "@/lib/admin-list-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    format?: string;
    categoryId?: string;
    period?: string;
  }>;
};

export default async function AdminEventsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = normalizeAdminListQuery(sp.q);
  const format = sp.format ?? "";
  const categoryId = sp.categoryId ?? "";
  const period = sp.period ?? "";

  const [categories, events] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.event.findMany({
      where: eventListWhere({ q, format, categoryId, period }),
      orderBy: { startsAt: "desc" },
      include: {
        _count: { select: { registrations: true } },
        category: { select: { name: true } },
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  const hasFilters = Boolean(q || format || categoryId || period);

  const filters = (
    <>
      <div className="flex min-w-[8.5rem] flex-col gap-1.5">
        <Label htmlFor="filter-format" className="text-xs">
          Format
        </Label>
        <select
          id="filter-format"
          name="format"
          defaultValue={format}
          className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
        >
          <option value="">All</option>
          <option value="ONLINE">Online</option>
          <option value="OFFLINE">Offline</option>
        </select>
      </div>
      <div className="min-w-[10rem] flex-1 flex-col gap-1.5 sm:max-w-[14rem]">
        <Label htmlFor="filter-category" className="text-xs">
          Category
        </Label>
        <select
          id="filter-category"
          name="categoryId"
          defaultValue={categoryId}
          className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex min-w-[9rem] flex-col gap-1.5">
        <Label htmlFor="filter-period" className="text-xs">
          Period
        </Label>
        <select
          id="filter-period"
          name="period"
          defaultValue={period}
          className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
        >
          <option value="">All dates</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold tracking-tight">All events</h2>

      <AdminListToolbar
        action="/admin/events"
        defaultQuery={q}
        placeholder="Title or description"
        filters={filters}
        resetHref="/admin/events"
        showReset={hasFilters}
      />

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-2.5 font-medium">Title</th>
              <th className="p-2.5 font-medium">Category</th>
              <th className="p-2.5 font-medium">Starts</th>
              <th className="p-2.5 font-medium">Attendees</th>
              <th className="p-2.5 font-medium">Owner</th>
              <th className="text-muted-foreground min-w-[7.25rem] whitespace-nowrap p-2.5 text-right text-xs font-medium uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-2.5">
                  <Link
                    href={`/admin/events/${e.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {e.title}
                  </Link>
                </td>
                <td className="text-muted-foreground p-2.5">
                  {e.category?.name ?? "—"}
                </td>
                <td className="text-muted-foreground p-2.5 tabular-nums">
                  {e.startsAt.toLocaleString("en-US", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-2.5 tabular-nums">
                  {e._count.registrations}
                  {e.capacity != null ? ` / ${e.capacity}` : ""}
                </td>
                <td className="text-muted-foreground max-w-[200px] truncate p-2.5 text-xs">
                  <span className="block truncate font-medium text-foreground">
                    {e.user.name}
                  </span>
                  <span className="block truncate">{e.user.email}</span>
                </td>
                <td className="p-2.5 text-right whitespace-nowrap">
                  <div className="flex flex-row flex-nowrap items-center justify-end gap-0.5">
                    <Link
                      href={`/admin/events/${e.id}#attendees`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Attendees"
                      aria-label="Attendees"
                    >
                      <Users className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                      )}
                      title="Edit"
                      aria-label="Edit event"
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <form
                      action={adminDeleteEvent.bind(null, e.id)}
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
                        title="Delete"
                        aria-label="Delete event"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && (
        <p className="text-muted-foreground text-sm">
          {hasFilters
            ? "Nothing found — adjust filters or search."
            : "No events yet."}
        </p>
      )}
    </div>
  );
}
