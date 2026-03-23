"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { registrationSchema } from "@/lib/schemas/registration";
import type { ActionState } from "@/app/actions/events";
import { parseRecordId } from "@/lib/record-id";

export async function registerForEvent(
  eventIdRaw: string | number,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) {
    return { ok: false, message: "Invalid event" };
  }
  const parsed = registrationSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event) {
    return { ok: false, message: "Event not found" };
  }
  if (
    event.capacity != null &&
    event._count.registrations >= event.capacity
  ) {
    return { ok: false, message: "Registration closed: capacity reached" };
  }

  try {
    await db.registration.create({
      data: {
        eventId,
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        message: "You are already registered for this event",
      };
    }
    throw e;
  }

  revalidatePath(`/${event.publicCode}`);
  revalidatePath("/");
  return { ok: true, message: "You are registered successfully" };
}
