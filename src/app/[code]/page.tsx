import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFormat, RegistrationMode } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventCoverImage } from "@/components/event-cover-image";
import { EventRegisterForm } from "@/components/event-register-form";
import {
  avatarBackgroundFromEmail,
  initialsFromName,
} from "@/lib/avatar-style";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/user-session";
import { isStaffAccess } from "@/lib/staff-access";
import { formatEventDateRange, formatLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { isValidEventPublicCode } from "@/lib/event-public-code";

type Props = { params: Promise<{ code: string }> };

export default async function EventPage({ params }: Props) {
  const { code } = await params;
  if (!isValidEventPublicCode(code)) notFound();

  const event = await db.event.findUnique({
    where: { publicCode: code },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
      registrationQuestions: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          optionsJson: true,
          required: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
  });
  if (!event) notFound();

  const user = await getSessionUser();
  const staff = await isStaffAccess();
  const isOwner = user != null && event.userId === user.id;
  const canEdit = isOwner || staff;
  const registered = event._count.registrations;
  const full =
    event.capacity != null && registered >= event.capacity;
  const hostInitials = initialsFromName(event.user.name);
  const hostAvatarBg = avatarBackgroundFromEmail(event.user.email ?? event.user.name);
  const mapQuery = event.location?.trim() ?? "";
  const locationMapUrl = (event as typeof event & { locationMapUrl?: string | null })
    .locationMapUrl;
  const meetingUrl = (event as typeof event & { meetingUrl?: string | null }).meetingUrl;
  const registrationMode = (
    event as typeof event & { registrationMode?: RegistrationMode }
  ).registrationMode ?? RegistrationMode.INTERNAL;
  const externalRegistrationUrl = (
    event as typeof event & { externalRegistrationUrl?: string | null }
  ).externalRegistrationUrl;
  const externalSourceLabel = (
    event as typeof event & { externalSourceLabel?: string | null }
  ).externalSourceLabel;
  let userRegisteredForEvent = false;
  if (user?.email) {
    const reg = await db.registration.findFirst({
      where: { eventId: event.id, email: user.email.toLowerCase() },
      select: { id: true },
    });
    userRegisteredForEvent = !!reg;
  }
  const canShowMeetingLink = !!meetingUrl && (canEdit || userRegisteredForEvent);
  const mapsEmbedUrl = !locationMapUrl && mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;
  const mapsOpenUrl = locationMapUrl?.trim()
    ? locationMapUrl.trim()
    : mapQuery
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  return (
    <article className="grid grid-cols-1 items-start gap-6 lg:gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <aside className="flex flex-col gap-4">
        <div className="border-border bg-card rounded-2xl border p-3">
          <EventCoverImage
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-square max-h-[26rem] rounded-xl ring-1 ring-black/5 dark:ring-white/10"
          />
        </div>

        <section className="border-border bg-card rounded-2xl border p-4">
          <h2 className="text-sm font-semibold tracking-tight">About organizer</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            {event.user.bio?.trim() || "Hosting curated events on Luna."}
          </p>
        </section>

        <section className="border-border bg-card rounded-2xl border p-4">
          <h2 className="text-sm font-semibold tracking-tight">Organizer</h2>
          <div className="mt-3 flex items-center gap-3">
            {event.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={event.user.avatarUrl}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/15"
              />
            ) : (
              <span
                className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white shadow-inner ring-1 ring-black/10 dark:ring-white/15"
                style={{ backgroundColor: hostAvatarBg }}
                aria-hidden
              >
                {hostInitials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{event.user.name}</p>
              {event.user.username ? (
                <Link
                  href={`/u/${event.user.username}`}
                  className="text-primary text-xs underline-offset-4 hover:underline"
                >
                  @{event.user.username}
                </Link>
              ) : (
                <p className="text-muted-foreground text-xs">Luna host</p>
              )}
            </div>
          </div>
          <p className="text-muted-foreground mt-3 text-sm">
            Attendees:{" "}
            <span className="text-foreground font-medium">
              {registered}
              {event.capacity != null ? ` / ${event.capacity}` : ""}
            </span>
          </p>
        </section>
      </aside>

      <section className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          {event.category?.name ? (
            <Badge variant="outline">{event.category.name}</Badge>
          ) : null}
          <Badge variant="secondary">{formatLabel(event.format)}</Badge>
          {registrationMode === RegistrationMode.EXTERNAL ? (
            <Badge variant="outline">External registration</Badge>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            {event.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {formatEventDateRange(event.startsAt, event.endsAt)}
          </p>
          {event.format === EventFormat.OFFLINE && event.location ? (
            <p className="text-sm">
              <span className="text-muted-foreground">Location: </span>
              {event.location}
            </p>
          ) : (
            <p className="text-sm">
              <span className="text-muted-foreground">Meeting link: </span>
              {canShowMeetingLink ? (
                <a
                  href={meetingUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  Join meeting
                </a>
              ) : (
                <span className="text-muted-foreground">
                  Available after registration
                </span>
              )}
            </p>
          )}
        </div>

        {canEdit ? (
          <Link
            href={`/${event.publicCode}/edit`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit",
            )}
          >
            Edit
          </Link>
        ) : null}

        <section className="border-border border-t pt-4">
          <h2 className="text-base font-semibold tracking-tight">Registration</h2>
          {registrationMode === RegistrationMode.EXTERNAL ? (
            <>
              <p className="text-muted-foreground mt-1 mb-4 max-w-xl text-sm leading-relaxed">
                Registration is handled on the organizer&apos;s side.
                {externalSourceLabel ? ` Source: ${externalSourceLabel}.` : ""}
              </p>
              <div className="border-border bg-card rounded-2xl border p-4 sm:p-5">
                <a
                  href={externalRegistrationUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "sm" }), "w-full sm:w-auto")}
                >
                  Register on external site
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mt-1 mb-4 max-w-xl text-sm leading-relaxed">
                Submit a join request via the registration block below. The form opens
                in a modal with required fields.
              </p>
              <EventRegisterForm
                eventId={event.id}
                closed={full}
                isAuthenticated={!!user}
                profileName={user?.name}
                profileEmail={user?.email ?? undefined}
                isRegistered={userRegisteredForEvent}
                eventTitle={event.title}
                startsAtIso={event.startsAt.toISOString()}
                endsAtIso={event.endsAt.toISOString()}
                eventLocation={event.location}
                eventUrl={`/${event.publicCode}`}
                questions={event.registrationQuestions}
              />
            </>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-base font-semibold tracking-tight">Description</h2>
          <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
            {event.description}
          </p>
        </section>

        {mapsEmbedUrl ? (
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold tracking-tight">Map</h2>
              {mapsOpenUrl ? (
                <a
                  href={mapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-xs font-medium underline underline-offset-4"
                >
                  Open in Maps
                </a>
              ) : null}
            </div>
            <div className="border-border bg-card overflow-hidden rounded-2xl border">
              <iframe
                title={`Map for ${event.title}`}
                src={mapsEmbedUrl}
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </section>
        ) : null}
      </section>
    </article>
  );
}
