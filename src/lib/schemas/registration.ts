import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(120),
  email: z.string().trim().email("Invalid email").max(320),
});
