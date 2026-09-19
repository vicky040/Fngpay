import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { buildGoogleAuthUrl, isGoogleAuthConfigured } from "@/lib/google-oauth";

export const GOOGLE_STATE_COOKIE = "fngpay_google_state";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  if (!isGoogleAuthConfigured()) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Google sign-in isn't configured yet — see .env for the two values it needs.")}`
    );
  }

  const state = randomBytes(16).toString("hex");
  const res = NextResponse.redirect(buildGoogleAuthUrl(origin, state));
  res.cookies.set(GOOGLE_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
  return res;
}
