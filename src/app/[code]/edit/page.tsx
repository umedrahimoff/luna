import Link from "next/link";
import { notFound } from "next/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { isStaffAccess } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import { cn } from "@/lib/utils";
import { isValidEventPublicCode } from "@/lib/event-public-code";

type Props = { params: Promise<{ code: string }> };

export default async function EditEventPage({ params }: Props) {
  const { code } = await params;
  if (!isValidEventPublicCode(code)) notFound();

  const user = await getSessionUser();
  const staff = await isStaffAccess();
  const event = await db.event.findUnique({ where: { publicCode: code } });
  if (!event || (!staff && (!user || event.userId !== user.id))) notFound();

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Edit event
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{event.title}</p>
        </div>
        <Link
          href={`/${event.publicCode}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-fit")}
        >
          ← Back to event
        </Link>
      </div>
      <EventForm mode="edit" event={event} categories={categories} />
    </div>
  );
}
