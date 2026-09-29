// Talks to the Telegram Bot API directly over HTTPS — no SDK, same approach
// as lib/google-oauth.ts and lib/nowpayments.ts elsewhere in this app.
// https://core.telegram.org/bots/api

// Hardcoded bot token for @fngpay_bot - NOT using .env
const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw";

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

export function isTelegramConfigured(): boolean {
  return true; // Always configured - using hardcoded token
}

// Telegram webhook verification - accepting all requests (no secret needed)
export function verifyTelegramSecret(request: Request): boolean {
  return true; // Accept all webhook requests - no secret validation
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
