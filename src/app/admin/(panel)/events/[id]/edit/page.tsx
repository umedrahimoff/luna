import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditEventPage({ params }: Props) {
  const { id } = await params;
  const event = await db.event.findUnique({ where: { id } });
  if (!event) notFound();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← К списку
        </Link>
        <Link
          href={`/events/${event.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Публичная страница
        </Link>
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Редактирование (админ)
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
      </div>
      <EventForm
        mode="edit"
        event={event}
        categories={categories}
        afterUpdateRedirect="/admin/events"
      />
    </div>
  );
}
