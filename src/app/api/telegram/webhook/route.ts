import { NextResponse } from "next/server";
import { TelegramAuthKind } from "@prisma/client";
import { db } from "@/lib/db";
import {
  generateTelegramOneTimeCode,
  getTelegramBotToken,
} from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  const expected = process.env.LUNA_TELEGRAM_WEBHOOK_SECRET?.trim();
  if (expected && secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  if (!getTelegramBotToken()) {
    return NextResponse.json({ ok: false }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const msg = (
    body as {
      message?: {
        text?: string;
        chat?: { id?: number };
        from?: { id?: number };
      };
    }
  ).message;
  if (!msg?.text?.trim().toLowerCase().startsWith("/start")) {
    return NextResponse.json({ ok: true });
  }

  const chatId = msg.chat?.id;
  const fromId = msg.from?.id;
  if (chatId == null || fromId == null) {
    return NextResponse.json({ ok: true });
  }

  const telegramUserId = BigInt(fromId);

  await db.telegramAuthCode.deleteMany({
    where: {
      telegramUserId,
      kind: TelegramAuthKind.REGISTER,
      usedAt: null,
    },
  });

  const code = generateTelegramOneTimeCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.telegramAuthCode.create({
    data: {
      code,
      kind: TelegramAuthKind.REGISTER,
      telegramUserId,
      expiresAt,
    },
  });

  const token = getTelegramBotToken()!;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text:
        `Ваш код для регистрации Luna:\n\n<code>${code}</code>\n\n` +
        `Введите его на сайте вместе с логином, именем и фамилией. Срок действия 15 минут.`,
      parse_mode: "HTML",
    }),
  });

  return NextResponse.json({ ok: true });
}
