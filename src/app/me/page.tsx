import Link from "next/link";
import { db } from "@/lib/db";
import { getOrganizerId } from "@/lib/organizer";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function MePage() {
  const organizerId = await getOrganizerId();
  const events = await db.event.findMany({
    where: { organizerId },
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Мои события
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Создание и редактирование доступны только с этого браузера (cookie
            организатора).
          </p>
        </div>
        <Link
          href="/events/new"
          className={cn(buttonVariants({ size: "sm" }), "w-fit shrink-0")}
        >
          Новое событие
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          У вас пока нет событий.{" "}
          <Link href="/events/new" className="text-primary underline">
            Создать
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((e) => (
            <li key={e.id} className="flex flex-col gap-2">
              <EventCard
                event={{
                  ...e,
                  category: e.category,
                }}
                registeredCount={e._count.registrations}
                capacity={e.capacity}
              />
              <Link
                href={`/events/${e.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-fit",
                )}
              >
                Редактировать
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
