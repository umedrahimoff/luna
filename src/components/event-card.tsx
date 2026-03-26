import Link from "next/link";
import { EventFormat, RegistrationMode, type Event } from "@prisma/client";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventCoverImage } from "@/components/event-cover-image";
import { formatEventCardWhen, formatLabel } from "@/lib/format";

type Props = {
  event: Pick<
    Event,
    | "id"
    | "publicCode"
    | "title"
    | "startsAt"
    | "endsAt"
    | "format"
    | "location"
    | "coverImageUrl"
  > & {
    registrationMode?: Event["registrationMode"];
    category?: { name: string } | null;
  };
  registeredCount: number;
  capacity: number | null;
  externalBadgeLabel?: string;
};

/**
 * Luma-style card: metadata left, 1:1 cover right; whole card links to the event page (registration there).
 */
export function EventCard({
  event,
  registeredCount,
  capacity,
  externalBadgeLabel = "External event",
}: Props) {
  const isExternal = event.registrationMode === RegistrationMode.EXTERNAL;

  return (
    <Link
      href={`/${event.publicCode}`}
      className="group focus-visible:ring-ring block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Open event page: ${event.title}`}
    >
      <article className="border-border/80 bg-card/60 flex items-start gap-3 rounded-xl border p-3 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow,transform] hover:shadow-md dark:ring-white/[0.06] sm:gap-4 sm:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <p className="text-muted-foreground text-xs font-medium tabular-nums">
            <time dateTime={event.startsAt.toISOString()}>
              {formatEventCardWhen(event.startsAt, event.endsAt)}
            </time>
          </p>

          <h3 className="text-foreground group-hover:text-primary text-base leading-snug font-semibold tracking-tight sm:text-lg">
            {event.title}
          </h3>

          {(event.format === EventFormat.OFFLINE || event.format === EventFormat.HYBRID) &&
          event.location ? (
            <p className="text-muted-foreground flex items-start gap-1.5 text-[0.6875rem] leading-snug tracking-wide uppercase sm:text-xs">
              <MapPin
                className="mt-0.5 size-3.5 shrink-0 opacity-70"
                aria-hidden
              />
              <span className="line-clamp-2">{event.location}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            {event.category?.name ? (
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
              >
                {event.category.name}
              </Badge>
            ) : null}
            <Badge
              variant="secondary"
              className="rounded-lg px-2.5 py-0.5 text-xs font-medium"
            >
              {formatLabel(event.format)}
            </Badge>
            {!isExternal && capacity != null && (
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-0.5 text-xs"
              >
                {registeredCount}/{capacity} spots
              </Badge>
            )}
            {isExternal ? (
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-0.5 text-xs"
              >
                {externalBadgeLabel}
              </Badge>
            ) : null}
          </div>

          {!isExternal ? (
            <div className="border-border/50 mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-dashed pt-2">
              <span className="text-foreground text-xs font-semibold tabular-nums sm:text-sm">
                +{registeredCount}
              </span>
              <span className="text-muted-foreground text-xs">registered</span>
              {capacity != null && (
                <span className="text-muted-foreground/80 text-xs">
                  · cap {capacity}
                </span>
              )}
            </div>
          ) : null}
        </div>

        <EventCoverImage
          src={event.coverImageUrl}
          alt=""
          className="self-start w-[4.75rem] sm:w-24 md:w-28"
        />
      </article>
    </Link>
  );
}
