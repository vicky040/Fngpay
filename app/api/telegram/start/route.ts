import { NextResponse } from "next/server";
import { isTelegramConfigured } from "@/lib/telegram";

// The Register screen's "Get it now" link points here instead of directly
// at a t.me URL, so the bot username only has to live in one place
// (server-side env) and a not-yet-configured bot degrades to a friendly
// message instead of a dead Telegram deep link — same pattern as
// /api/auth/google's not-configured redirect.
// Hardcoded bot username - UPDATE THIS WITH YOUR NEW BOT USERNAME
const BOT_USERNAME = "YOUR_NEW_BOT_USERNAME";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isTelegramConfigured()) {
    return NextResponse.redirect(
      `${origin}/register?error=${encodeURIComponent("Telegram onboarding isn't set up yet.")}`
    );
  }

  return NextResponse.redirect(`https://t.me/${BOT_USERNAME}?start=register`);
}
