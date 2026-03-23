import Link from "next/link";
import { db } from "@/lib/db";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  categorySlug?: string;
  /** Base path for category chips, e.g. `/` or `/discover`. */
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
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

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
      category: { select: { name: true } },
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
            All
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
              {c.name}
            </Link>
          ))}
        </div>
      ) : null}

      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {isRegisteredOnly
            ? categorySlug
              ? "No registered events in this category."
              : "You are not registered for any events yet."
            : categorySlug
              ? "No events in this category yet."
              : "No events yet."}{" "}
          {isRegisteredOnly ? (
            <>
              <Link href="/discover" className="text-primary underline">
                Discover events
              </Link>
              .
            </>
          ) : (
            <>
              <Link href="/events/new" className="text-primary underline">
                Create the first one
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
                  category: e.category,
                }}
                registeredCount={e._count.registrations}
                capacity={e.capacity}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
