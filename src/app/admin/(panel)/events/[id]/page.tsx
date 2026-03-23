import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminEventAttendeesSection } from "@/components/admin-event-attendees-section";
import { AdminEventDetailTabNav } from "@/components/admin-event-detail-tab-nav";
import { AdminEntityLayout } from "@/components/admin-entity-layout";
import { AdminTechnicalAside } from "@/components/admin-technical-aside";
import { buttonVariants } from "@/components/ui/button-variants";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { formatAdminEntityDateTime } from "@/lib/admin-entity-meta";
import {
  normalizeAdminListQuery,
  registrationListWhere,
} from "@/lib/admin-list-queries";
import { formatEventDateRange, formatLabel } from "@/lib/format";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { findEventByRouteSegment } from "@/lib/event-by-route-segment";

export const dynamic = "force-dynamic";

const NOTE_AUDIT =
  "Overview and attendee list. Owner is userId; no separate audit log for admin edits.";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function AdminEventDetailPage({
  params,
  searchParams,
}: Props) {
  const { id: idRaw } = await params;
  const { q: rawQ, sort: sortRaw } = await searchParams;
  const q = normalizeAdminListQuery(rawQ);
  const sortOrder = sortRaw === "desc" ? "desc" : "asc";

  const head = await findEventByRouteSegment(idRaw, { select: { id: true } });
  if (!head) notFound();
  const eventId = head.id;

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        where: registrationListWhere(eventId, q),
        orderBy: { createdAt: sortOrder },
      },
      user: { select: { id: true, name: true, email: true } },
      category: { select: { id: true, name: true } },
      _count: { select: { registrations: true } },
    },
  });
  if (!event) notFound();

  const totalRegs = await db.registration.count({ where: { eventId } });
  const hasFilters = Boolean(q || sortRaw === "desc");
  const detailBase = `/admin/events/${encodeURIComponent(idRaw)}`;
  const listQs = new URLSearchParams();
  if (q) listQs.set("q", q);
  if (sortOrder === "desc") listQs.set("sort", "desc");
  const listQuery = listQs.toString();
  const detailWithListQuery = listQuery ? `${detailBase}?${listQuery}` : detailBase;

  const sortFilter = (
    <div className="flex min-w-[11rem] flex-col gap-1.5">
      <Label htmlFor="filter-sort" className="text-xs">
        Order
      </Label>
      <select
        id="filter-sort"
        name="sort"
        defaultValue={sortOrder === "desc" ? "desc" : "asc"}
        className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
      >
        <option value="asc">Oldest first</option>
        <option value="desc">Newest first</option>
      </select>
    </div>
  );

  const registered = event._count.registrations;
  const capacityLine =
    event.capacity != null
      ? `${registered} / ${event.capacity}`
      : String(registered);

  const main = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Events
        </Link>
        <Link
          href={`/${event.publicCode}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Public page
        </Link>
        <Link
          href={`${detailBase}/edit`}
          className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5")}
        >
          <Pencil className="size-4" aria-hidden />
          Edit event
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-muted-foreground mt-1 font-mono text-xs">
          /{event.publicCode}
        </p>
      </div>

      <div className="border-border bg-card scroll-mt-20 overflow-hidden rounded-xl border ring-1 ring-black/5">
        <AdminEventDetailTabNav
          overviewHref={`${detailWithListQuery}#overview`}
          attendeesHref={`${detailWithListQuery}#attendees`}
        />
        <div className="bg-background space-y-8 p-4">
      <section id="overview" className="scroll-mt-[5.5rem]">
        <h2 className="sr-only">General Information</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Schedule
            </dt>
            <dd className="mt-1 text-sm">
              {formatEventDateRange(event.startsAt, event.endsAt)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Format
            </dt>
            <dd className="mt-1 text-sm">{formatLabel(event.format)}</dd>
          </div>
          {event.format === "OFFLINE" && event.location ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                Location
              </dt>
              <dd className="mt-1 text-sm">{event.location}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Registrations
            </dt>
            <dd className="mt-1 text-sm tabular-nums">{capacityLine}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Category
            </dt>
            <dd className="mt-1 text-sm">{event.category?.name ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Owner
            </dt>
            <dd className="mt-1 text-sm">
              <span className="font-medium">{event.user.name}</span>
              <span className="text-muted-foreground block text-xs">
                {event.user.email}
              </span>
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Description
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
              {event.description}
            </dd>
          </div>
        </dl>
      </section>

      <section id="attendees" className="scroll-mt-[5.5rem] border-border border-t pt-8">
        <h2 className="sr-only">Attendees</h2>
        <AdminEventAttendeesSection
          action={detailBase}
          defaultQuery={q}
          resetHref={`${detailBase}#attendees`}
          showReset={hasFilters}
          filters={sortFilter}
          registrations={event.registrations}
          totalRegs={totalRegs}
          searchQuery={q}
        />
      </section>
        </div>
      </div>
    </>
  );

  const aside = (
    <AdminTechnicalAside
      fields={[
        { label: "Public URL", value: `/${event.publicCode}`, mono: true },
        { label: "Event ID", value: event.id, mono: true },
        {
          label: "Created",
          value: formatAdminEntityDateTime(event.createdAt),
        },
        {
          label: "Updated",
          value: formatAdminEntityDateTime(event.updatedAt),
        },
        {
          label: "Owner",
          value: (
            <>
              {event.user.name}
              <span className="text-muted-foreground mt-0.5 block text-[0.65rem] font-normal">
                {event.user.email}
              </span>
            </>
          ),
        },
        {
          label: "Format",
          value: formatLabel(event.format),
        },
        {
          label: "Attendees",
          value: String(totalRegs),
        },
        {
          label: "Category",
          value: event.category?.name ?? "—",
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
