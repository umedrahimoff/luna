"use server";

import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EventFormat, Prisma, RegistrationMode } from "@prisma/client";
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
  values?: ReturnType<typeof formDataToObject>;
};

function formDataToObject(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    endsAt: String(formData.get("endsAt") ?? ""),
    format: String(formData.get("format") ?? "") as EventFormat,
    registrationMode:
      String(formData.get("registrationMode") ?? "") as RegistrationMode,
    ownerUserId: String(formData.get("ownerUserId") ?? "") || undefined,
    externalRegistrationUrl:
      String(formData.get("externalRegistrationUrl") ?? "") || undefined,
    externalSourceLabel:
      String(formData.get("externalSourceLabel") ?? "") || undefined,
    location: String(formData.get("location") ?? "") || undefined,
    locationMapUrl: String(formData.get("locationMapUrl") ?? "") || undefined,
    meetingUrl: String(formData.get("meetingUrl") ?? "") || undefined,
    capacity: String(formData.get("capacity") ?? ""),
    coverImageUrl: "",
    categoryId: String(formData.get("categoryId") ?? ""),
  };
}

async function uploadEventCover(
  file: FormDataEntryValue | null,
): Promise<{ ok: true; url: string | null } | { ok: false; message: string }> {
  if (!(file instanceof File) || file.size <= 0) {
    return { ok: true, url: null };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, message: "Cover image must be 5MB or smaller" };
  }
  const t = file.type.toLowerCase();
  const ext =
    t === "image/jpeg" || t === "image/jpg"
      ? "jpg"
      : t === "image/png"
        ? "png"
        : t === "image/webp"
          ? "webp"
          : null;
  if (!ext) {
    return { ok: false, message: "Allowed cover formats: JPG, PNG, WEBP" };
  }
  const fileName = `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const relPath = `/uploads/events/${fileName}`;
  const absDir = path.join(process.cwd(), "public", "uploads", "events");
  const absPath = path.join(absDir, fileName);
  await mkdir(absDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  await writeFile(absPath, Buffer.from(bytes));
  return { ok: true, url: relPath };
}

export async function createEvent(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  const values = formDataToObject(formData);
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
      values,
    };
  }
  const startsAt = parseStartsAt(parsed.data.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      fieldErrors: { startsAt: ["Invalid date"] },
      values,
    };
  }
  const endsAt = parseEndsAt(parsed.data.endsAt);
  if (!endsAt) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["Invalid date"] },
      values,
    };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["End must be after start"] },
      values,
    };
  }
  const category = await db.category.findUnique({
    where: { id: parsed.data.categoryId },
  });
  if (!category) {
    return {
      ok: false,
      fieldErrors: { categoryId: ["Category not found"] },
      values,
    };
  }
  const staff = await isStaffAccess();
  let ownerUserId = user.id;
  if (staff && parsed.data.ownerUserId) {
    const targetOwnerId = parseRecordId(parsed.data.ownerUserId);
    if (targetOwnerId == null) {
      return {
        ok: false,
        fieldErrors: { ownerUserId: ["Select a valid organizer"] },
        values,
      };
    }
    const targetOwner = await db.user.findUnique({
      where: { id: targetOwnerId },
      select: { id: true },
    });
    if (!targetOwner) {
      return {
        ok: false,
        fieldErrors: { ownerUserId: ["Organizer not found"] },
        values,
      };
    }
    ownerUserId = targetOwner.id;
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
    locationMapUrl:
      parsed.data.format === EventFormat.OFFLINE
        ? parsed.data.locationMapUrl?.trim() || null
        : null,
    meetingUrl:
      parsed.data.format === EventFormat.ONLINE
        ? parsed.data.meetingUrl?.trim() || null
        : null,
    registrationMode: parsed.data.registrationMode,
    externalRegistrationUrl:
      parsed.data.registrationMode === RegistrationMode.EXTERNAL
        ? parsed.data.externalRegistrationUrl?.trim() || null
        : null,
    externalSourceLabel:
      parsed.data.registrationMode === RegistrationMode.EXTERNAL
        ? parsed.data.externalSourceLabel?.trim() || null
        : null,
    capacity: capacityFromForm(parsed.data.capacity),
    coverImageUrl: null as string | null,
    categoryId: category.id,
    userId: ownerUserId,
  };
  const coverUpload = await uploadEventCover(formData.get("coverImage"));
  if (!coverUpload.ok) {
    return {
      ok: false,
      fieldErrors: { coverImage: [coverUpload.message] },
      values,
    };
  }
  baseData.coverImageUrl = coverUpload.url;

  let createdPublicCode: string | null = null;
  for (let i = 0; i < 24; i++) {
    const publicCode = generateEventPublicCode();
    try {
      const createdEvent = await db.event.create({
        data: { ...baseData, publicCode },
        select: { publicCode: true },
      });
      createdPublicCode = createdEvent.publicCode;
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
  if (!createdPublicCode) {
    return { ok: false, message: "Could not generate event link code" };
  }

  revalidatePath("/");
  revalidatePath("/me");
  revalidatePath("/admin");
  revalidatePath("/admin/events");
  redirect(`/${createdPublicCode}`);
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
  const values = formDataToObject(formData);
  const parsed = eventFormSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
      values,
    };
  }
  const startsAt = parseStartsAt(parsed.data.startsAt);
  if (!startsAt) {
    return {
      ok: false,
      fieldErrors: { startsAt: ["Invalid date"] },
      values,
    };
  }
  const endsAt = parseEndsAt(parsed.data.endsAt);
  if (!endsAt) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["Invalid date"] },
      values,
    };
  }
  if (endsAt.getTime() <= startsAt.getTime()) {
    return {
      ok: false,
      fieldErrors: { endsAt: ["End must be after start"] },
      values,
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
      values,
    };
  }
  const coverUpload = await uploadEventCover(formData.get("coverImage"));
  if (!coverUpload.ok) {
    return {
      ok: false,
      fieldErrors: { coverImage: [coverUpload.message] },
      values,
    };
  }
  const nextCoverImageUrl =
    coverUpload.url ?? coverUrlFromForm(existing.coverImageUrl ?? undefined);
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
      locationMapUrl:
        parsed.data.format === EventFormat.OFFLINE
          ? parsed.data.locationMapUrl?.trim() || null
          : null,
      meetingUrl:
        parsed.data.format === EventFormat.ONLINE
          ? parsed.data.meetingUrl?.trim() || null
          : null,
      registrationMode: parsed.data.registrationMode,
      externalRegistrationUrl:
        parsed.data.registrationMode === RegistrationMode.EXTERNAL
          ? parsed.data.externalRegistrationUrl?.trim() || null
          : null,
      externalSourceLabel:
        parsed.data.registrationMode === RegistrationMode.EXTERNAL
          ? parsed.data.externalSourceLabel?.trim() || null
          : null,
      capacity: capacityFromForm(parsed.data.capacity),
      coverImageUrl: nextCoverImageUrl,
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
