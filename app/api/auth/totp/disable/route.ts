import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { verifyTotp } from "@/lib/totp";

// Requires a currently-valid code to turn off — otherwise anyone who
// hijacks a session could disable 2FA without ever having the phone.
export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const code = String(body.code ?? "");

  const { rows } = await pool.query("SELECT totp_secret FROM agents WHERE id = $1", [auth.agent.id]);
  const secret = rows[0]?.totp_secret;
  if (!secret || !verifyTotp(secret, code)) {
    return NextResponse.json({ error: "Enter your current authenticator code to disable it." }, { status: 400 });
  }

  await pool.query("UPDATE agents SET totp_secret = NULL, totp_confirmed_at = NULL, two_factor_enabled = FALSE WHERE id = $1", [
    auth.agent.id,
  ]);
  return NextResponse.json({ ok: true });
}
