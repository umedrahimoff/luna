const TG_API = "https://api.telegram.org";

export function getTelegramBotToken(): string | null {
  const t = process.env.LUNA_TELEGRAM_BOT_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
}

export function generateTelegramOneTimeCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  for (let i = 0; i < 8; i += 1) {
    out += chars[bytes[i]! % chars.length];
  }
  return out;
}

export async function telegramSendMessage(
  chatId: bigint,
  text: string,
): Promise<{ ok: boolean; description?: string }> {
  const token = getTelegramBotToken();
  if (!token) {
    return { ok: false, description: "Bot token not configured" };
  }
  const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: Number(chatId),
      text,
      parse_mode: "HTML",
    }),
  });
  const data = (await res.json()) as { ok: boolean; description?: string };
  return data;
}
