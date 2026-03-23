import { z } from "zod";
import { EventFormat } from "@prisma/client";

function optionalImageUrl(val: string | undefined): string | undefined {
  const t = val?.trim();
  return t || undefined;
}

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Укажите название").max(200),
    description: z.string().trim().min(1, "Добавьте описание").max(8000),
    startsAt: z.string().min(1, "Укажите дату и время"),
    format: z.nativeEnum(EventFormat),
    location: z.string().trim().max(500).optional(),
    capacity: z.string().optional(),
    coverImageUrl: z.string().optional(),
    categoryId: z.string().trim().min(1, "Выберите категорию"),
  })
  .superRefine((data, ctx) => {
    if (data.format === EventFormat.OFFLINE) {
      const loc = data.location?.trim();
      if (!loc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Укажите локацию для офлайн-события",
          path: ["location"],
        });
      }
    }
    const cap = data.capacity?.trim();
    if (cap) {
      const n = Number(cap);
      if (!Number.isInteger(n) || n < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Лимит — целое число больше 0",
          path: ["capacity"],
        });
      }
    }
    const cover = optionalImageUrl(data.coverImageUrl);
    if (cover) {
      try {
        const u = new URL(cover);
        if (u.protocol !== "http:" && u.protocol !== "https:") {
          throw new Error();
        }
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ссылка на обложку должна начинаться с http:// или https://",
          path: ["coverImageUrl"],
        });
      }
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export function parseStartsAt(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function capacityFromForm(capacity: string | undefined): number | null {
  const cap = capacity?.trim();
  if (!cap) return null;
  return Number(cap);
}

export function coverUrlFromForm(
  coverImageUrl: string | undefined,
): string | null {
  const c = coverImageUrl?.trim();
  return c || null;
}
