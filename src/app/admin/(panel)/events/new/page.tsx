import { redirect } from "next/navigation";
import { EventForm } from "@/components/event-form";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/user-session";
import { isStaffAccess } from "@/lib/staff-access";

export const dynamic = "force-dynamic";

export default async function AdminNewEventPage() {
  const [sessionUser, staff, categories, owners] = await Promise.all([
    getSessionUser(),
    isStaffAccess(),
    db.category.findMany({
      orderBy: { nameEn: "asc" },
      select: { id: true, name: true, nameEn: true },
    }),
    db.user.findMany({
      orderBy: [{ role: "desc" }, { name: "asc" }],
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  if (!sessionUser || !staff) {
    redirect("/admin/login");
  }

  const ownerOptions = owners.map((u) => ({
    id: u.id,
    name: `${u.name} (${u.role})`,
    email: u.email,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Create event (admin)</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Create an event from the admin panel and assign organizer ownership.
        </p>
      </div>
      <EventForm
        mode="create"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.nameEn ?? c.name,
        }))}
        ownerOptions={ownerOptions}
        defaultOwnerId={sessionUser.id}
      />
    </div>
  );
}
