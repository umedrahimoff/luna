"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { isStaffAccess } from "@/lib/staff-access";
import { getSessionUser } from "@/lib/user-session";
import { parseRecordId } from "@/lib/record-id";

export type QuestionsActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

const ALLOWED_TYPES = [
  "text",
  "options",
  "social",
  "company",
  "checkbox",
  "terms",
  "mobile",
  "website",
] as const;
type QuestionType = (typeof ALLOWED_TYPES)[number];

async function ensureCanManage(eventId: number): Promise<{ publicCode: string } | null> {
  const user = await getSessionUser();
  const staff = await isStaffAccess();
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: { userId: true, publicCode: true },
  });
  if (!event) return null;
  if (!staff && (!user || event.userId !== user.id)) return null;
  return { publicCode: event.publicCode };
}

export async function addRegistrationQuestion(
  eventIdRaw: string | number,
  _prev: QuestionsActionState | undefined,
  formData: FormData,
): Promise<QuestionsActionState> {
  const eventId = parseRecordId(eventIdRaw);
  if (eventId == null) return { ok: false, message: "Invalid event id" };
  const access = await ensureCanManage(eventId);
  if (!access) return { ok: false, message: "You do not have permission" };

  const label = String(formData.get("label") ?? "").trim();
  const type = String(formData.get("type") ?? "text").trim().toLowerCase();
  const required = String(formData.get("required") ?? "") === "on";
  if (!label) {
    return { ok: false, fieldErrors: { label: ["Enter question label"] } };
  }
  if (!ALLOWED_TYPES.includes(type as QuestionType)) {
    return { ok: false, message: "Unsupported question type" };
  }
  const options = type === "options" ? ["Option 1", "Option 2"] : [];
  const count = await db.eventRegistrationQuestion.count({ where: { eventId } });
  await db.eventRegistrationQuestion.create({
    data: {
      eventId,
      type,
      label,
      placeholder: null,
      optionsJson:
        options.length > 0 ? (options as Prisma.InputJsonValue) : undefined,
      required,
      sortOrder: count + 1,
    },
  });
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath(`/${access.publicCode}`);
  return { ok: true, message: "Question added" };
}

export async function deleteRegistrationQuestion(
  eventIdRaw: string | number,
  questionIdRaw: string | number,
): Promise<void> {
  const eventId = parseRecordId(eventIdRaw);
  const questionId = parseRecordId(questionIdRaw);
  if (eventId == null || questionId == null) return;
  const access = await ensureCanManage(eventId);
  if (!access) return;
  await db.eventRegistrationQuestion.deleteMany({
    where: { id: questionId, eventId },
  });
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath(`/${access.publicCode}`);
}
