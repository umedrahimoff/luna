"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { joinDisplayName } from "@/lib/display-name";
import {
  createUserSessionToken,
  setUserSessionCookie,
  userSessionConfigured,
} from "@/lib/user-token";
import {
  telegramLoginCompleteSchema,
  telegramLoginRequestSchema,
  telegramLoginSlugSchema,
  telegramRegisterSchema,
} from "@/lib/schemas/telegram-auth";
import { sendTelegramMessage, telegramBotConfigured } from "@/lib/telegram-api";

export type TelegramAuthState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function notConfigured(): TelegramAuthState {
  return {
    ok: false,
    message:
      "Telegram sign-in is not configured: set TELEGRAM_BOT_TOKEN in .env and point webhook to /api/telegram/webhook.",
  };
}

export async function registerWithTelegram(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message: "Sessions are disabled: set LUNA_SESSION_SECRET (>= 16 chars).",
    };
  }
  if (!telegramBotConfigured()) {
    return notConfigured();
  }

  const slugParsed = telegramLoginSlugSchema.safeParse(
    String(formData.get("loginSlug") ?? ""),
  );
  if (!slugParsed.success) {
    return {
      ok: false,
      fieldErrors: {
        loginSlug: [slugParsed.error.issues[0]?.message ?? "Invalid login"],
      },
    };
  }

  const parsed = telegramRegisterSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
  });
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { ok: false, fieldErrors: fe };
  }

  const codeNorm = parsed.data.code.trim().toUpperCase();
  const row = await db.telegramAuthCode.findFirst({
    where: {
      code: codeNorm,
      purpose: "signup",
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) {
    return {
      ok: false,
      message: "Invalid or expired code. Send /start to the bot again.",
    };
  }

  const existingTg = await db.user.findUnique({
    where: { telegramUserId: row.telegramUserId },
  });
  if (existingTg) {
    return {
      ok: false,
      message:
        "This Telegram account is already linked. Sign in with Telegram or email.",
    };
  }

  const takenLogin = await db.user.findUnique({
    where: { loginSlug: slugParsed.data },
  });
  if (takenLogin) {
    return {
      ok: false,
      fieldErrors: { loginSlug: ["This login is already taken."] },
    };
  }

  const email = `${row.telegramUserId}@tg.luna`;
  const name = joinDisplayName(parsed.data.firstName, parsed.data.lastName);
  const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);

  const user = await db.user.create({
    data: {
      email,
      name,
      loginSlug: slugParsed.data,
      telegramUserId: row.telegramUserId,
      passwordHash,
    },
  });

  await db.telegramAuthCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Failed to create session." };
  }
  await setUserSessionCookie(token);
  redirect("/me");
}

export async function requestTelegramLoginCode(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  if (!telegramBotConfigured()) {
    return notConfigured();
  }

  const parsed = telegramLoginRequestSchema.safeParse({
    loginSlug: String(formData.get("loginSlug") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const slugParsed = telegramLoginSlugSchema.safeParse(parsed.data.loginSlug);
  if (!slugParsed.success) {
    return {
      ok: false,
      fieldErrors: {
        loginSlug: [slugParsed.error.issues[0]?.message ?? "Invalid login"],
      },
    };
  }

  const user = await db.user.findUnique({
    where: { loginSlug: slugParsed.data },
  });
  if (!user?.telegramUserId) {
    return {
      ok: false,
      message:
        "User not found, or this login is available only for email/password sign in.",
    };
  }

  await db.telegramAuthCode.deleteMany({
    where: {
      userId: user.id,
      purpose: "login",
      usedAt: null,
    },
  });

  const code = randomBytes(4).toString("hex").toUpperCase();
  await db.telegramAuthCode.create({
    data: {
      code,
      telegramUserId: user.telegramUserId,
      purpose: "login",
      userId: user.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const sent = await sendTelegramMessage(
    user.telegramUserId,
    `Your Luna sign-in code: ${code}\n\nThis code is valid for 10 minutes.`,
  );
  if (!sent.ok) {
    await db.telegramAuthCode.deleteMany({
      where: { code, purpose: "login", userId: user.id },
    });
    return { ok: false, message: `Failed to send code: ${sent.error}` };
  }

  return { ok: true, message: "Code sent to Telegram." };
}

export async function completeTelegramLogin(
  _prev: TelegramAuthState | undefined,
  formData: FormData,
): Promise<TelegramAuthState> {
  if (!userSessionConfigured()) {
    return {
      ok: false,
      message: "Sessions are disabled: set LUNA_SESSION_SECRET (>= 16 chars).",
    };
  }

  const parsed = telegramLoginCompleteSchema.safeParse({
    loginSlug: String(formData.get("loginSlug") ?? ""),
    code: String(formData.get("code") ?? ""),
  });
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const slugParsed = telegramLoginSlugSchema.safeParse(parsed.data.loginSlug);
  if (!slugParsed.success) {
    return {
      ok: false,
      fieldErrors: {
        loginSlug: [slugParsed.error.issues[0]?.message ?? "Invalid login"],
      },
    };
  }

  const user = await db.user.findUnique({
    where: { loginSlug: slugParsed.data },
  });
  if (!user) {
    return { ok: false, message: "User not found." };
  }

  const codeNorm = parsed.data.code.trim().toUpperCase();
  const row = await db.telegramAuthCode.findFirst({
    where: {
      code: codeNorm,
      purpose: "login",
      userId: user.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) {
    return {
      ok: false,
      message: "Invalid or expired code.",
    };
  }

  await db.telegramAuthCode.update({
    where: { id: row.id },
    data: { usedAt: new Date() },
  });

  const token = createUserSessionToken(user.id);
  if (!token) {
    return { ok: false, message: "Failed to create session." };
  }
  await setUserSessionCookie(token);

  const next = String(formData.get("next") ?? "").trim();
  if (next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect("/me");
}
