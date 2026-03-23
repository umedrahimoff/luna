import { redirect } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/user-session";

export default async function NewEventPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/events/new");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New event</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Fill in the fields — the event will appear in the public list.
        </p>
      </div>
      <EventForm mode="create" categories={categories} />
    </div>
  );
}
