import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFormat } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventCoverImage } from "@/components/event-cover-image";
import { EventRegisterForm } from "@/components/event-register-form";
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

  return (
    <article className="flex flex-col gap-5">
      <div className="mx-auto w-full max-w-[13.5rem] sm:max-w-sm">
        <EventCoverImage
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full rounded-xl ring-1 ring-black/5 dark:ring-white/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {event.category?.name ? (
            <Badge variant="outline">{event.category.name}</Badge>
          ) : null}
          <Badge variant="secondary">{formatLabel(event.format)}</Badge>
          <span className="text-muted-foreground text-sm">
            {registered}
            {event.capacity != null ? ` / ${event.capacity}` : ""}{" "}
            registered
          </span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          {event.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {formatEventDateRange(event.startsAt, event.endsAt)}
        </p>
        {event.format === EventFormat.OFFLINE && event.location && (
          <p className="text-sm">
            <span className="text-muted-foreground">Location: </span>
            {event.location}
          </p>
        )}
        {event.format === EventFormat.ONLINE && (
          <p className="text-muted-foreground text-sm">Format: online</p>
        )}
      </div>

      <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
        {event.description}
      </p>

      {canEdit && (
        <Link
          href={`/${event.publicCode}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          Edit
        </Link>
      )}

      <section className="border-t pt-4">
        <h2 className="text-base font-semibold tracking-tight">
          Registration
        </h2>
        <p className="text-muted-foreground mt-1 mb-4 max-w-xl text-sm leading-relaxed">
          Enter your name and email — that is enough. After submitting you are
          on the attendee list; if capacity is set and full, the form is
          disabled.
        </p>
        <EventRegisterForm eventId={event.id} closed={full} />
      </section>
    </article>
  );
}
