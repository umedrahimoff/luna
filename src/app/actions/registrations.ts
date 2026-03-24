"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { registrationSchema } from "@/lib/schemas/registration";
import type { ActionState } from "@/app/actions/events";
import { parseRecordId } from "@/lib/record-id";
import { getSessionUser } from "@/lib/user-session";

function hasUnsupportedJsonError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");
  return (
    message.includes("Value JSON not supported") ||
    message.includes("Conversion failed")
  );
}

export async function registerForEvent(
  eventIdRaw: string | number,
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const sessionUser = await getSessionUser();
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) {
    return { ok: false, message: "Invalid event" };
  }
  let name: string;
  let email: string;
  if (sessionUser) {
    name = sessionUser.name.trim();
    email = sessionUser.email?.toLowerCase() ?? "";
    if (!name) {
      return { ok: false, message: "Update your profile name before registering" };
    }
    if (!email) {
      return { ok: false, message: "Add your email in profile before registering" };
    }
  } else {
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
    name = parsed.data.name;
    email = parsed.data.email.toLowerCase();
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: {
      _count: { select: { registrations: true } },
      registrationQuestions: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          optionsJson: true,
          required: true,
        },
      },
    },
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

  const dynamicFieldErrors: Record<string, string[]> = {};
  const answers: Record<string, string | boolean> = {};
  for (const q of event.registrationQuestions) {
    const key = `q_${q.id}`;
    if (q.type === "checkbox" || q.type === "terms") {
      const checked = String(formData.get(key) ?? "") === "on";
      if (q.required && !checked) {
        dynamicFieldErrors[key] = ["This field is required"];
      } else {
        answers[String(q.id)] = checked;
      }
      continue;
    }
    const value = String(formData.get(key) ?? "").trim();
    if (q.required && !value) {
      dynamicFieldErrors[key] = ["This field is required"];
    } else if (value) {
      answers[String(q.id)] = value.slice(0, 500);
    }
  }
  if (Object.keys(dynamicFieldErrors).length > 0) {
    return { ok: false, fieldErrors: dynamicFieldErrors };
  }

  try {
    const createData = {
      eventId,
      name,
      email,
      answersJson:
        Object.keys(answers).length > 0
          ? (answers as Prisma.InputJsonValue)
          : undefined,
    };
    try {
      await db.registration.create({ data: createData });
    } catch (e) {
      if (!hasUnsupportedJsonError(e)) throw e;
      await db.registration.create({
        data: {
          eventId,
          name,
          email,
        },
      });
    }
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
