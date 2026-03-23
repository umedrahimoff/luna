"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventFormat } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminSession } from "@/lib/admin-auth";
import { getOrganizerId } from "@/lib/organizer";
import {
  capacityFromForm,
  coverUrlFromForm,
  eventFormSchema,
  parseStartsAt,
} from "@/lib/schemas/event";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function formDataToObject(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    format: String(formData.get("format") ?? "") as EventFormat,
    location: String(formData.get("location") ?? "") || undefined,
    capacity: String(formData.get("capacity") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
  };
}

export async function createEvent(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const startsAt = parseStartsAt(parsed.data.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      fieldErrors: { startsAt: ["Некорректная дата"] },
    };
  }
  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Категория не найдена"] },
    };
  }
  const organizerId = await getOrganizerId();
  await db.event.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startsAt,
      format: parsed.data.format,
      location:
        parsed.data.format === EventFormat.OFFLINE
          ? parsed.data.location?.trim() ?? null
          : null,
      capacity: capacityFromForm(parsed.data.capacity),
      coverImageUrl: coverUrlFromForm(parsed.data.coverImageUrl),
      categoryId: category.id,
      organizerId,
    },
  });
  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  redirect("/me");
}

export async function updateEvent(
  eventId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const redirectAfter = String(formData.get("_redirect") ?? "");
  const parsed = eventFormSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }
  const startsAt = parseStartsAt(parsed.data.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      fieldErrors: { startsAt: ["Некорректная дата"] },
    };
  }
  const organizerId = await getOrganizerId();
  const admin = await isAdminSession();
  const existing = await db.event.findUnique({ where: { id: eventId } });
  if (!existing || (!admin && existing.organizerId !== organizerId)) {
    return { ok: false, message: "Нет прав на редактирование" };
  }
  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Категория не найдена"] },
    };
  }
  await db.event.update({
    where: { id: eventId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startsAt,
      format: parsed.data.format,
      location:
        parsed.data.format === EventFormat.OFFLINE
          ? parsed.data.location?.trim() ?? null
          : null,
      capacity: capacityFromForm(parsed.data.capacity),
      coverImageUrl: coverUrlFromForm(parsed.data.coverImageUrl),
      categoryId: category.id,
    },
  });
  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/edit`);
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  if (
    admin &&
    redirectAfter === "/admin/events"
  ) {
    redirect("/admin/events");
  }
  redirect(`/events/${eventId}`);
}
