import Link from "next/link";
import { db } from "@/lib/db";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getUserLanguage } from "@/lib/i18n/server";
import { localizedName } from "@/lib/localized-name";
import { cn } from "@/lib/utils";

type Props = {
  categorySlug?: string;
  /** Base path for category chips, e.g. `/` or `/events`. */
  listBasePath: string;
  /**
   * When set, only events where this email has a registration (matched case-insensitively).
   * When omitted, all events (subject to category filter).
   */
  registeredEmail?: string;
};

export async function PublicEventList({
  categorySlug,
  listBasePath,
  registeredEmail,
}: Props) {
  const [language, categories] = await Promise.all([
    getUserLanguage(),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, nameEn: true, nameRu: true },
    }),
  ]);
  const t = getDictionary(language);

  const emailNorm = registeredEmail?.trim().toLowerCase();

  const events = await db.event.findMany({
    where: {
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(emailNorm
        ? {
            registrations: {
              some: { email: emailNorm },
            },
          }
        : {}),
    },
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true, nameEn: true, nameRu: true } },
    },
  });

  const chipHref = (slug?: string) => {
    const q = slug ? `?category=${encodeURIComponent(slug)}` : "";
    return `${listBasePath}${q}`;
  };

  const isRegisteredOnly = Boolean(emailNorm);

  return (
    <>
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href={chipHref()}
            className={cn(
              buttonVariants({
                variant: categorySlug ? "outline" : "secondary",
                size: "sm",
              }),
            )}
          >
            {t.eventList.all}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={chipHref(c.slug)}
              className={cn(
                buttonVariants({
                  variant:
                    categorySlug === c.slug ? "secondary" : "outline",
                  size: "sm",
                }),
              )}
            >
              {localizedName(c, language)}
            </Link>
          ))}
        </div>
      ) : null}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {isRegisteredOnly
            ? categorySlug
              ? t.eventList.noRegisteredInCategory
              : t.eventList.noRegisteredAny
            : categorySlug
              ? t.eventList.noEventsInCategory
              : t.eventList.noEventsAny}{" "}
          {isRegisteredOnly ? (
            <>
              <Link href="/" className="text-primary underline">
                {t.eventList.discoverEvents}
              </Link>
              .
            </>
          ) : (
            <>
              <Link href="/events/new" className="text-primary underline">
                {t.eventList.createFirst}
              </Link>
              .
            </>
          )}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e) => (
            <li key={e.id}>
              <EventCard
                event={{
                  ...e,
                  registrationMode: e.registrationMode,
                  category: e.category
                    ? { name: localizedName(e.category, language) }
                    : null,
                }}
                registeredCount={e._count.registrations}
                capacity={e.capacity}
                externalBadgeLabel={t.eventPage.externalRegistration}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
