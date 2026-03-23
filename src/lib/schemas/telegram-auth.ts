import { z } from "zod";

export const telegramRegisterSchema = z.object({
  code: z.string().trim().min(6, "Введите код").max(16),
  login: z.string().trim().min(2).max(30),
  firstName: z.string().trim().min(1, "Введите имя").max(60),
  lastName: z.string().trim().max(60),
});

export const telegramLoginCodeSchema = z.object({
  login: z.string().trim().min(1, "Введите логин").max(64),
});

export const telegramLoginVerifySchema = z.object({
  login: z.string().trim().min(1).max(64),
  code: z.string().trim().min(6).max(16),
});
