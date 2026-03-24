import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Enter first name").max(60),
  lastName: z.string().trim().max(60),
  email: z.string().trim().email("Invalid email").max(320),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(320),
  password: z.string().min(1, "Enter password"),
});
