import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/require-user";
import { EventCard } from "@/components/event-card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default async function MePage() {
  const user = await requireUser();
  const events = await db.event.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            My events
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Signed in as <span className="text-foreground">{user.name}</span> (
            {user.email})
          </p>
        </div>
        <Link
          href="/events/new"
          className={cn(buttonVariants({ size: "sm" }), "w-fit shrink-0")}
        >
          New event
        </Link>
      </div>
      {events.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          You have no events yet.{" "}
          <Link href="/events/new" className="text-primary underline">
            Create one
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
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
                href={`/${e.publicCode}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "w-fit",
                )}
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
