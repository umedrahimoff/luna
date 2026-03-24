import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTelegramMessage, telegramBotConfigured } from "@/lib/telegram-api";

export const runtime = "nodejs";

/**
 * Telegram Bot API webhook. Set with:
 * `https://api.telegram.org/bot<TOKEN>/setWebhook?url=<HTTPS_URL>/api/telegram/webhook`
 * Optional header: `secret_token` -> validated against TELEGRAM_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const token = req.headers.get("x-telegram-bot-api-secret-token");
    if (token !== secret) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = (body as { message?: { chat?: { id?: number }; text?: string } })
    .message;
  if (!msg || typeof msg.chat?.id !== "number") {
    return NextResponse.json({ ok: true });
  }

  const text = String(msg.text ?? "").trim();
  if (!text.startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const chatId = String(msg.chat.id);

  if (!telegramBotConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const code = randomBytes(4).toString("hex").toUpperCase();

  await db.telegramAuthCode.deleteMany({
    where: {
      telegramUserId: chatId,
      purpose: "signup",
      usedAt: null,
    },
  });

  await db.telegramAuthCode.create({
    data: {
      code,
      telegramUserId: chatId,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  await sendTelegramMessage(
    chatId,
    [
      "Hi! Your Luna sign-up code:",
      "",
      code,
      "",
      "Enter it on the website in 'Sign up with Telegram'. The code is valid for 10 minutes.",
    ].join("\n"),
  );

  return NextResponse.json({ ok: true });
}
