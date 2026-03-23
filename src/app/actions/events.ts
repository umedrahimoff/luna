"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventFormat, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isStaffAccess } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import {
  capacityFromForm,
  coverUrlFromForm,
  eventFormSchema,
  parseEndsAt,
  parseStartsAt,
} from "@/lib/schemas/event";
import { parseRecordId } from "@/lib/record-id";
import { generateEventPublicCode } from "@/lib/event-public-code";

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
    endsAt: String(formData.get("endsAt") ?? ""),
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
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
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
      fieldErrors: { startsAt: ["Invalid date"] },
    };
  }
  const endsAt = parseEndsAt(parsed.data.endsAt);
  if (!endsAt) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["Invalid date"] },
    };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["End must be after start"] },
    };
  }
  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Category not found"] },
    };
  }
  const baseData = {
    title: parsed.data.title,
    description: parsed.data.description,
    startsAt,
    endsAt,
    format: parsed.data.format,
    location:
      parsed.data.format === EventFormat.OFFLINE
        ? parsed.data.location?.trim() ?? null
        : null,
    capacity: capacityFromForm(parsed.data.capacity),
    coverImageUrl: coverUrlFromForm(parsed.data.coverImageUrl),
    categoryId: category.id,
    userId: user.id,
  };

  let created = false;
  for (let i = 0; i < 24; i++) {
    const publicCode = generateEventPublicCode();
    try {
      await db.event.create({
        data: { ...baseData, publicCode },
      });
      created = true;
      break;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        continue;
      }
      throw e;
    }
  }
  if (!created) {
    return { ok: false, message: "Could not generate event link code" };
  }

  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  redirect("/me");
}

export async function updateEvent(
  eventIdRaw: string | number,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) {
    return { ok: false, message: "Invalid event id" };
  }
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
      fieldErrors: { startsAt: ["Invalid date"] },
    };
  }
  const endsAt = parseEndsAt(parsed.data.endsAt);
  if (!endsAt) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["Invalid date"] },
    };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["End must be after start"] },
    };
  }
  const user = await getSessionUser();
  const staff = await isStaffAccess();
  const existing = await db.event.findUnique({ where: { id: eventId } });
  if (!existing || (!staff && (!user || existing.userId !== user.id))) {
    return { ok: false, message: "You do not have permission to edit this event" };
  }
  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Category not found"] },
    };
  }
  await db.event.update({
    where: { id: eventId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startsAt,
      endsAt,
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
  revalidatePath(`/${existing.publicCode}`);
  revalidatePath(`/${existing.publicCode}/edit`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/events/${eventId}/edit`);
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}`);
  if (staff && redirectAfter === "/admin/events") {
    redirect("/admin/events");
  }
  redirect(`/${existing.publicCode}`);
}
