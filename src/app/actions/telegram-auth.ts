"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { TelegramAuthKind } from "@prisma/client";
import { db } from "@/lib/db";
import { joinDisplayName } from "@/lib/display-name";
import {
  telegramLoginCodeSchema,
  telegramLoginVerifySchema,
  telegramRegisterSchema,
} from "@/lib/schemas/telegram-auth";
import {
  createUserSessionToken,
  setUserSessionCookie,
  userSessionConfigured,
} from "@/lib/user-token";
import {
  generateTelegramOneTimeCode,
  getTelegramBotToken,
  telegramSendMessage,
} from "@/lib/telegram";
import { parsePublicUsername } from "@/lib/username";

export type TelegramAuthState = {
  ok: boolean;
  message?: string;
};

const CODE_TTL_MS = 15 * 60 * 1000;

function syntheticEmailFromLogin(login: string): string {
  return `${login.toLowerCase()}@telegram.luna`;
}

export async function registerWithTelegramCode(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message:
        "Сессии отключены: задайте LUNA_SESSION_SECRET (≥16 символов) в .env",
    };
  }

  const parsed = telegramRegisterSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    login: String(formData.get("login") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0],
    };
  }

  const uCheck = parsePublicUsername(parsed.data.login);
  if (!uCheck.ok) {
    return { ok: false, message: uCheck.message };
  }
  if (!uCheck.value) {
    return { ok: false, message: "Укажите логин (латиница, цифры, _)." };
  }
  const login = uCheck.value;

  const codeNorm = parsed.data.code.trim().toUpperCase();
  const row = await db.telegramAuthCode.findUnique({
    where: { code: codeNorm },
  });
  if (
    !row ||
    row.kind !== TelegramAuthKind.REGISTER ||
    row.usedAt != null ||
    row.expiresAt <= new Date()
  ) {
    return {
      ok: false,
      message: "Неверный или просроченный код. Запросите новый через бота.",
    };
  }

  const email = syntheticEmailFromLogin(login);
  const name = joinDisplayName(parsed.data.firstName, parsed.data.lastName);

  const exists = await db.user.findFirst({
    where: {
      OR: [{ email }, { username: login }],
    },
    select: { id: true },
  });
  if (exists) {
    return { ok: false, message: "Такой логин или аккаунт уже заняты." };
  }

  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  try {
    await db.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email,
          name,
          username: login,
          passwordHash,
          telegramUserId: row.telegramUserId,
        },
      });
      await tx.telegramAuthCode.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      });
    });
  } catch {
    return { ok: false, message: "Не удалось создать аккаунт. Попробуйте снова." };
  }

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (!user) {
    return { ok: false, message: "Ошибка после регистрации." };
  }
  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Не удалось создать сессию." };
  }
  await setUserSessionCookie(token);
  redirect("/me");
}

export async function requestTelegramLoginCode(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  const parsed = telegramLoginCodeSchema.safeParse({
    login: String(formData.get("login") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0],
    };
  }

  const raw = parsed.data.login.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: {
      OR: [{ username: raw }, { email: raw }],
    },
    select: { id: true, telegramUserId: true },
  });
  if (!user?.telegramUserId) {
    return {
      ok: false,
      message:
        "Пользователь не найден или Telegram не привязан. Войдите по паролю или зарегистрируйтесь через бота.",
    };
  }

  if (!getTelegramBotToken()) {
    return {
      ok: false,
      message:
        "Бот не настроен (LUNA_TELEGRAM_BOT_TOKEN). Обратитесь к администратору.",
    };
  }

  const code = generateTelegramOneTimeCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await db.telegramAuthCode.create({
    data: {
      code,
      kind: TelegramAuthKind.LOGIN,
      telegramUserId: user.telegramUserId,
      expiresAt,
    },
  });

  const sent = await telegramSendMessage(
    user.telegramUserId,
    `Код для входа в Luna: <b>${code}</b>\n\nСрок действия 15 минут.`,
  );
  if (!sent.ok) {
    await db.telegramAuthCode.deleteMany({ where: { code } });
    return {
      ok: false,
      message: sent.description ?? "Не удалось отправить код в Telegram.",
    };
  }

  return {
    ok: true,
    message: "Код отправлен в Telegram. Введите его ниже.",
  };
}

export async function loginWithTelegramCode(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message:
        "Сессии отключены: задайте LUNA_SESSION_SECRET в .env",
    };
  }

  const parsed = telegramLoginVerifySchema.safeParse({
    login: String(formData.get("login") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      message: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0],
    };
  }

  const raw = parsed.data.login.trim().toLowerCase();
  const user = await db.user.findFirst({
    where: {
      OR: [{ username: raw }, { email: raw }],
    },
    select: { id: true, telegramUserId: true },
  });
  if (!user?.telegramUserId) {
    return { ok: false, message: "Пользователь не найден." };
  }

  const codeNorm = parsed.data.code.trim().toUpperCase();
  const row = await db.telegramAuthCode.findUnique({
    where: { code: codeNorm },
  });
  if (
    !row ||
    row.kind !== TelegramAuthKind.LOGIN ||
    row.usedAt != null ||
    row.expiresAt <= new Date() ||
    row.telegramUserId !== user.telegramUserId
  ) {
    return { ok: false, message: "Неверный или просроченный код." };
  }

  await db.telegramAuthCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Не удалось создать сессию." };
  }
  await setUserSessionCookie(token);
  const next = String(formData.get("next") ?? "").trim();
  if (next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect("/me");
}
