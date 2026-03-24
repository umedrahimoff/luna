function botToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
}

export function telegramBotConfigured(): boolean {
  return botToken() != null;
}

export async function sendTelegramMessage(
  chatId: string,
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = botToken();
  if (!token) {
    return { ok: false, error: "Bot is not configured (TELEGRAM_BOT_TOKEN)." };
  }
  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
      }),
    },
  );
  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!res.ok || !data.ok) {
    return {
      ok: false,
      error: data.description ?? `HTTP ${res.status}`,
    };
  }
  return { ok: true };
}
