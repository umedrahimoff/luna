"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { registrationSchema } from "@/lib/schemas/registration";
import type { ActionState } from "@/app/actions/events";

export async function registerForEvent(
  eventId: string,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
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
    return { ok: false, message: "Событие не найдено" };
  }
  if (
    event.capacity != null &&
    event._count.registrations >= event.capacity
  ) {
    return { ok: false, message: "Регистрация закрыта: достигнут лимит мест" };
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
        message: "Вы уже зарегистрированы на это событие",
      };
    }
    throw e;
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
  return { ok: true, message: "Вы успешно зарегистрированы" };
}
