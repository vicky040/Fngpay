import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { generateBase32Secret, buildOtpAuthUri } from "@/lib/totp";

// Generates a fresh pending secret and returns everything needed to enroll
// it in an authenticator app. Safe to call again before confirming (each
// call replaces the still-unconfirmed secret); once totp_confirmed_at is
// set, re-running this would invalidate the working secret before a new one
// is confirmed, so the UI only offers it pre-confirmation or as an explicit
// "reset" action.
export async function POST() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const secret = generateBase32Secret();
  await pool.query("UPDATE agents SET totp_secret = $1, totp_confirmed_at = NULL, two_factor_enabled = FALSE WHERE id = $2", [
    secret,
    auth.agent.id,
  ]);

  const otpauthUri = buildOtpAuthUri(secret, auth.agent.email);
  const qrDataUri = await QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 });

  return NextResponse.json({ secret, otpauthUri, qrDataUri });
}
