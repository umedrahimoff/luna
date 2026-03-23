import Link from "next/link";
import { db } from "@/lib/db";
import { adminDeleteEvent } from "@/app/actions/admin-data";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await db.event.findMany({
    orderBy: { startsAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold tracking-tight">Все события</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 font-medium">Название</th>
              <th className="p-3 font-medium">Категория</th>
              <th className="p-3 font-medium">Начало</th>
              <th className="p-3 font-medium">Участники</th>
              <th className="p-3 font-medium">Организатор</th>
              <th className="p-3 font-medium">Действия</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="p-3">
                  <Link
                    href={`/events/${e.id}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {e.title}
                  </Link>
                </td>
                <td className="text-muted-foreground p-3">
                  {e.category?.name ?? "—"}
                </td>
                <td className="text-muted-foreground p-3 tabular-nums">
                  {e.startsAt.toLocaleString("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="p-3 tabular-nums">
                  {e._count.registrations}
                  {e.capacity != null ? ` / ${e.capacity}` : ""}
                </td>
                <td className="text-muted-foreground max-w-[120px] truncate p-3 font-mono text-xs">
                  {e.organizerId.slice(0, 8)}…
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/events/${e.id}/participants`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                      )}
                    >
                      Участники
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                      )}
                    >
                      Править
                    </Link>
                    <form action={adminDeleteEvent.bind(null, e.id)}>
                      <button
                        type="submit"
                        className={cn(
                          buttonVariants({
                            variant: "destructive",
                            size: "sm",
                          }),
                        )}
                      >
                        Удалить
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {events.length === 0 && (
        <p className="text-muted-foreground text-sm">Событий пока нет.</p>
      )}
    </div>
  );
}
