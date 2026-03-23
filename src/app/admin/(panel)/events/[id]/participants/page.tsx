import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEventParticipantsPage({ params }: Props) {
  const { id } = await params;
  const event = await db.event.findUnique({
    where: { id },
    include: {
      registrations: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!event) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/events"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← События
        </Link>
        <Link
          href={`/events/${event.id}`}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Публичная страница
        </Link>
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Участники</h2>
        <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-3 font-medium">Имя</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Зарегистрирован</th>
            </tr>
          </thead>
          <tbody>
            {event.registrations.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">{r.name}</td>
                <td className="text-muted-foreground p-3">{r.email}</td>
                <td className="text-muted-foreground p-3 tabular-nums">
                  {r.createdAt.toLocaleString("ru-RU", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {event.registrations.length === 0 && (
        <p className="text-muted-foreground text-sm">Пока никто не записался.</p>
      )}
    </div>
  );
}
