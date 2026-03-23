import { z } from "zod";
import { EventFormat } from "@prisma/client";

function optionalImageUrl(val: string | undefined): string | undefined {
  const t = val?.trim();
  return t || undefined;
}

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1, "Enter a title").max(200),
    description: z.string().trim().min(1, "Add a description").max(8000),
    startsAt: z.string().min(1, "Enter start date and time"),
    endsAt: z.string().min(1, "Enter end date and time"),
    format: z.nativeEnum(EventFormat),
    location: z.string().trim().max(500).optional(),
    capacity: z.string().optional(),
    coverImageUrl: z.string().optional(),
    categoryId: z.coerce.number().int().positive("Select a category"),
  })
  .superRefine((data, ctx) => {
    if (data.format === EventFormat.OFFLINE) {
      const loc = data.location?.trim();
      if (!loc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a location for offline events",
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
          message: "Capacity must be a whole number greater than 0",
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
          message: "Cover URL must start with http:// or https://",
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

export function parseEndsAt(value: string): Date | null {
  return parseStartsAt(value);
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
