import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";

export default async function NewEventPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Новое событие</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Заполните поля — событие появится в общем списке.
        </p>
      </div>
      <EventForm mode="create" categories={categories} />
    </div>
  );
}
