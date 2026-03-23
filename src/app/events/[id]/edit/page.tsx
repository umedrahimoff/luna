import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/admin-auth";
import { getOrganizerId } from "@/lib/organizer";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;
  const organizerId = await getOrganizerId();
  const admin = await isAdminSession();
  const event = await db.event.findUnique({ where: { id } });
  if (!event || (!admin && event.organizerId !== organizerId)) notFound();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Редактирование
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
        </div>
        <Link
          href={`/events/${event.id}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
        >
          ← К событию
        </Link>
      </div>
      <EventForm mode="edit" event={event} categories={categories} />
    </div>
  );
}
