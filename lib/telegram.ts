// Talks to the Telegram Bot API directly over HTTPS — no SDK, same approach
// as lib/google-oauth.ts and lib/nowpayments.ts elsewhere in this app.
// https://core.telegram.org/bots/api

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`;
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

// Telegram lets you set a secret when registering the webhook URL and sends
// it back on every call in this header — the only way to confirm a webhook
// request actually came from Telegram and not someone guessing the URL.
// With no secret configured yet, every request is accepted (dev mode).
export function verifyTelegramSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) return true;
  return request.headers.get("x-telegram-bot-api-secret-token") === expected;
}

export async function sendTelegramMessage(chatId: number | string, text: string): Promise<void> {
  const res = await fetch(apiUrl("sendMessage"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${res.status} ${await res.text()}`);
  }
}

// Telegram's sendPhoto needs actual image bytes (multipart) or a public URL
// — a data: URI in JSON isn't accepted, so the QR's base64 payload is
// re-packed as a Blob here.
export async function sendTelegramPhoto(chatId: number | string, qrDataUri: string, caption: string): Promise<void> {
  const base64 = qrDataUri.split(",")[1] ?? qrDataUri;
  const bytes = Buffer.from(base64, "base64");

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", caption);
  form.append("photo", new Blob([new Uint8Array(bytes)], { type: "image/png" }), "deposit-qr.png");

  const res = await fetch(apiUrl("sendPhoto"), { method: "POST", body: form });
  if (!res.ok) {
    throw new Error(`Telegram sendPhoto failed: ${res.status} ${await res.text()}`);
  }
}
