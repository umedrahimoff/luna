"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/admin-guard";
import { parseRecordId } from "@/lib/record-id";

export async function adminDeleteEvent(eventIdRaw: string | number): Promise<void> {
  await requireStaff();
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) redirect("/admin/events");
  await db.event.delete({ where: { id: eventId } });
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath("/me");
  redirect("/admin/events");
}
