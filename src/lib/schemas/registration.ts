import { z } from "zod";

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Укажите имя").max(120),
  email: z.string().trim().email("Некорректный email").max(320),
});
