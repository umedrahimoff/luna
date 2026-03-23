import Link from "next/link";
import { db } from "@/lib/db";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Search = { category?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { category: categorySlug } = await searchParams;

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const events = await db.event.findMany({
    where: categorySlug
      ? { category: { slug: categorySlug } }
      : undefined,
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Ближайшие события
        </h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
          События по дате начала.{" "}
          <strong className="font-medium text-foreground">
            Чтобы записаться
          </strong>
          , откройте карточку — внизу страницы события форма регистрации (имя и
          email). На самой карточке кнопки нет — как в Luma.
        </p>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({
                variant: categorySlug ? "outline" : "secondary",
                size: "sm",
              }),
            )}
          >
            Все
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/?category=${encodeURIComponent(c.slug)}`}
              className={cn(
                buttonVariants({
                  variant:
                    categorySlug === c.slug ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {categorySlug
            ? "В этой категории пока нет событий."
            : "Пока нет событий."}{" "}
          <Link href="/events/new" className="text-primary underline">
            Создайте первое
          </Link>
          .
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((e) => (
            <li key={e.id}>
              <EventCard
                event={{
                  ...e,
                  category: e.category,
                }}
                registeredCount={e._count.registrations}
                capacity={e.capacity}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
