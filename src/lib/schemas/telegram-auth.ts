import { z } from "zod";
import { RESERVED_USERNAMES } from "@/lib/username";

const slugRegex = /^[a-z0-9_]{3,30}$/;

export const telegramLoginSlugSchema = z
  .string()
  .trim()
  .transform((s) => s.toLowerCase())
  .pipe(
    z
      .string()
      .regex(slugRegex, "3-30 chars: lowercase latin letters, numbers, underscore.")
      .refine((s) => !RESERVED_USERNAMES.has(s), "This login is reserved."),
  );

export const telegramRegisterSchema = z.object({
  code: z.string().trim().min(4, "Enter Telegram code").max(32),
  firstName: z.string().trim().min(1, "Enter first name").max(60),
  lastName: z.string().trim().max(60),
});

export const telegramLoginRequestSchema = z.object({
  loginSlug: z.string().min(1, "Enter login"),
});

export const telegramLoginCompleteSchema = z.object({
  loginSlug: z
    .string()
    .min(1, "Enter login first, then click 'Send code to Telegram'."),
  code: z.string().trim().min(4, "Enter code").max(32),
});
