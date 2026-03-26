import { z } from "zod";
import { AppLanguage } from "@prisma/client";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name").max(60),
  lastName: z.string().trim().max(60),
  email: z
    .string()
    .trim()
    .max(320)
    .transform((s) => (s === "" ? undefined : s))
    .refine((s) => (s ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) : true), "Invalid email"),
  bio: z
    .string()
    .max(2000, "Bio is too long")
    .transform((s) => (s.trim() === "" ? undefined : s.trim())),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(200),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm"),
});

export const updatePreferencesSchema = z.object({
  preferredLanguage: z.nativeEnum(AppLanguage),
});
