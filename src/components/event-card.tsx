import Link from "next/link";
import { EventFormat, type Event } from "@prisma/client";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventCoverImage } from "@/components/event-cover-image";
import {
  formatEventListDate,
  formatEventTime,
  formatLabel,
} from "@/lib/format";

type Props = {
  event: Pick<
    Event,
    | "id"
    | "title"
    | "startsAt"
    | "format"
    | "location"
    | "coverImageUrl"
  > & {
    category?: { name: string } | null;
  };
  registeredCount: number;
  capacity: number | null;
};

/**
 * Карточка как на Luma: слева метаданные, справа обложка 1:1; вся карточка ведёт на страницу события (там регистрация).
 */
export function EventCard({ event, registeredCount, capacity }: Props) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group focus-visible:ring-ring block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Открыть страницу события: ${event.title}`}
    >
      <article className="border-border/80 bg-card/60 flex items-start gap-4 rounded-2xl border p-4 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow,transform] hover:shadow-md dark:ring-white/[0.06] sm:gap-5 sm:p-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-muted-foreground text-xs font-medium tabular-nums sm:text-sm">
            <time dateTime={event.startsAt.toISOString()}>
              {formatEventTime(event.startsAt)}
            </time>
            <span className="text-muted-foreground/60 mx-1.5">·</span>
            <span className="uppercase tracking-wide">
              {formatEventListDate(event.startsAt)}
            </span>
          </p>

          <h3 className="text-foreground group-hover:text-primary text-lg leading-snug font-semibold tracking-tight sm:text-xl">
            {event.title}
          </h3>

          {event.format === EventFormat.OFFLINE && event.location ? (
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
            {capacity != null && (
              <Badge
                variant="outline"
                className="rounded-lg px-2.5 py-0.5 text-xs"
              >
                {registeredCount}/{capacity} мест
              </Badge>
            )}
          </div>

          <div className="border-border/50 mt-auto flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-dashed pt-3">
            <span className="text-foreground text-sm font-semibold tabular-nums">
              +{registeredCount}
            </span>
            <span className="text-muted-foreground text-xs">зарегистрировано</span>
            {capacity != null && (
              <span className="text-muted-foreground/80 text-xs">
                · лимит {capacity}
              </span>
            )}
          </div>
        </div>

        <EventCoverImage
          src={event.coverImageUrl}
          alt=""
          className="self-start w-[5.25rem] sm:w-28 md:w-32"
        />
      </article>
    </Link>
  );
}
