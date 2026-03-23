import Link from "next/link";
import { db } from "@/lib/db";
import { AdminListToolbar } from "@/components/admin-list-toolbar";
import { buttonVariants } from "@/components/ui/button-variants";
import { normalizeAdminListQuery } from "@/lib/admin-list-queries";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ e?: string; q?: string }>;
};

export default async function AdminHomePage({ searchParams }: Props) {
  const { e: error, q: rawQ } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);

  const [events, registrations, categories, eventMatches, userMatches] =
    await Promise.all([
      db.event.count(),
      db.registration.count(),
      db.category.count(),
      q
        ? db.event.findMany({
            where: {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
              ],
            },
            take: 8,
            orderBy: { startsAt: "desc" },
            select: { id: true, title: true, startsAt: true },
          })
        : Promise.resolve([]),
      q
        ? db.user.findMany({
            where: {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
              ],
            },
            take: 8,
            orderBy: { createdAt: "desc" },
            select: { id: true, name: true, email: true },
          })
        : Promise.resolve([]),
    ]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold tracking-tight">Overview</h2>

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
        action="/admin"
        defaultQuery={q}
        placeholder="Events and users"
        resetHref="/admin"
        showReset={Boolean(q)}
      />

      {q ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="bg-card rounded-xl border p-4 ring-1 ring-black/5">
            <h3 className="text-sm font-semibold">Events</h3>
            {eventMatches.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">No matches.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {eventMatches.map((ev) => (
                  <li key={ev.id}>
                    <Link
                      href={`/admin/events/${ev.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      {ev.title}
                    </Link>
                    <span className="text-muted-foreground ml-2 tabular-nums text-xs">
                      {ev.startsAt.toLocaleString("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/admin/events?q=${encodeURIComponent(q)}`}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "mt-3 h-auto px-0",
              )}
            >
              All events for this query →
            </Link>
          </section>
          <section className="bg-card rounded-xl border p-4 ring-1 ring-black/5">
            <h3 className="text-sm font-semibold">Users</h3>
            {userMatches.length === 0 ? (
              <p className="text-muted-foreground mt-2 text-sm">No matches.</p>
            ) : (
              <ul className="mt-2 space-y-1.5 text-sm">
                {userMatches.map((u) => (
                  <li key={u.id}>
                    <Link
                      href={`/admin/users/${u.id}/edit`}
                      className="text-primary hover:underline"
                    >
                      {u.name}
                    </Link>
                    <span className="text-muted-foreground ml-2 text-xs">
                      {u.email}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={`/admin/users?q=${encodeURIComponent(q)}`}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "mt-3 h-auto px-0",
              )}
            >
              All users for this query →
            </Link>
          </section>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-3">
        <li className="bg-card rounded-xl border p-4 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">Events</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{events}</p>
        </li>
        <li className="bg-card rounded-xl border p-4 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">Registrations</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {registrations}
          </p>
        </li>
        <li className="bg-card rounded-xl border p-4 ring-1 ring-black/5">
          <p className="text-muted-foreground text-sm">Categories</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {categories}
          </p>
        </li>
      </ul>
      <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
        <strong className="text-foreground">Moderators</strong> manage events and
        references. <strong className="text-foreground">Administrators</strong>{" "}
        can also manage users and roles. Regular users create events and register
        from public pages.
      </p>
    </div>
  );
}
