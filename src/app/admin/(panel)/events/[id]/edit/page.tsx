import Link from "next/link";
import { notFound } from "next/navigation";
import type { Event } from "@prisma/client";
import { AdminEventAttendeesSection } from "@/components/admin-event-attendees-section";
import { AdminEventEditPanels } from "@/components/admin-event-edit-panels";
import { AdminEntityLayout } from "@/components/admin-entity-layout";
import { AdminTechnicalAside } from "@/components/admin-technical-aside";
import { EventForm } from "@/components/event-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Label } from "@/components/ui/label";
import { formatAdminEntityDateTime } from "@/lib/admin-entity-meta";
import {
  normalizeAdminListQuery,
  registrationListWhere,
} from "@/lib/admin-list-queries";
import { formatLabel } from "@/lib/format";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { findEventByRouteSegment } from "@/lib/event-by-route-segment";

export const dynamic = "force-dynamic";

const NOTE_AUDIT =
  "Owner is the user linked to the event (userId). There is no separate audit log for admin edits; see Updated.";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string; sort?: string }>;
};

export default async function AdminEditEventPage({
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
  const editBase = `/admin/events/${encodeURIComponent(idRaw)}/edit`;
  const listQs = new URLSearchParams();
  if (q) listQs.set("q", q);
  if (sortOrder === "desc") listQs.set("sort", "desc");
  const listQuery = listQs.toString();
  const editWithListQuery = listQuery ? `${editBase}?${listQuery}` : editBase;

  const sortFilter = (
    <div className="flex min-w-[11rem] flex-col gap-1.5">
      <Label htmlFor="filter-sort-edit" className="text-xs">
        Order
      </Label>
      <select
        id="filter-sort-edit"
        name="sort"
        defaultValue={sortOrder === "desc" ? "desc" : "asc"}
        className="border-input bg-background h-9 w-full rounded-lg border px-2 text-sm"
      >
        <option value="asc">Oldest first</option>
        <option value="desc">Newest first</option>
      </select>
    </div>
  );

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const afterSave = `/admin/events/${encodeURIComponent(idRaw)}/edit`;

  const main = (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
        <h2 className="text-base font-semibold tracking-tight">
          Edit event (admin)
        </h2>
      </div>

      <AdminEventEditPanels
        overviewHref={`${editWithListQuery}#overview`}
        attendeesHref={`${editWithListQuery}#attendees`}
        overview={
          <>
            <h3 id="tab-overview" className="sr-only">
              General information
            </h3>
            <EventForm
              mode="edit"
              event={event as Event}
              categories={categories}
              afterUpdateRedirect={afterSave}
            />
          </>
        }
        attendees={
          <>
            <h3 id="tab-attendees" className="sr-only">
              Attendees
            </h3>
            <AdminEventAttendeesSection
              action={editBase}
              defaultQuery={q}
              resetHref={`${editWithListQuery}#attendees`}
              showReset={hasFilters}
              filters={sortFilter}
              registrations={event.registrations}
              totalRegs={totalRegs}
              searchQuery={q}
            />
          </>
        }
      />
    </div>
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
          label: "Owner (record author)",
          value: `${event.user.name} (${event.user.email})`,
        },
        {
          label: "Category",
          value: event.category
            ? `${event.category.name} (${event.category.id})`
            : "—",
          mono: !!event.category,
        },
        {
          label: "Format",
          value: formatLabel(event.format),
        },
        {
          label: "Registrations",
          value: String(event._count.registrations),
        },
      ]}
      note={NOTE_AUDIT}
    />
  );

  return <AdminEntityLayout main={main} aside={aside} />;
}
