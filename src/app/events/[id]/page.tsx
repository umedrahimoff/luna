import Link from "next/link";
import { notFound } from "next/navigation";
import { EventFormat } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventCoverImage } from "@/components/event-cover-image";
import { RegisterForm } from "@/components/register-form";
import { db } from "@/lib/db";
import { getOrganizerId } from "@/lib/organizer";
import { formatEventDate, formatLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });
  if (!event) notFound();

  const organizerId = await getOrganizerId();
  const isOwner = event.organizerId === organizerId;
  const registered = event._count.registrations;
  const full =
    event.capacity != null && registered >= event.capacity;

  return (
    <article className="flex flex-col gap-8">
      <div className="mx-auto w-full max-w-sm">
        <EventCoverImage
          src={event.coverImageUrl}
          alt={event.title}
          className="w-full rounded-2xl ring-1 ring-black/5 dark:ring-white/10"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {event.category?.name ? (
            <Badge variant="outline">{event.category.name}</Badge>
          ) : null}
          <Badge variant="secondary">{formatLabel(event.format)}</Badge>
          <span className="text-muted-foreground text-sm">
            {registered}
            {event.capacity != null ? ` / ${event.capacity}` : ""}{" "}
            зарегистрировалось
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {event.title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {formatEventDate(event.startsAt)}
        </p>
        {event.format === EventFormat.OFFLINE && event.location && (
          <p className="text-sm">
            <span className="text-muted-foreground">Локация: </span>
            {event.location}
          </p>
        )}
        {event.format === EventFormat.ONLINE && (
          <p className="text-muted-foreground text-sm">Формат: онлайн</p>
        )}
      </div>

      <p className="text-foreground whitespace-pre-wrap text-base leading-relaxed">
        {event.description}
      </p>

      {isOwner && (
        <Link
          href={`/events/${event.id}/edit`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
        >
          Редактировать
        </Link>
      )}

      <section className="border-t pt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Запись на мероприятие
        </h2>
        <p className="text-muted-foreground mt-1 mb-5 max-w-xl text-sm leading-relaxed">
          Укажите имя и email — этого достаточно. После отправки вы в списке
          участников; если задан лимит мест и он исчерпан, форма недоступна.
        </p>
        <RegisterForm eventId={event.id} closed={full} />
      </section>
    </article>
  );
}
