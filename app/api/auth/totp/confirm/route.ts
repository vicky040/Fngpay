import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { verifyTotp } from "@/lib/totp";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const code = String(body.code ?? "");

  const { rows } = await pool.query("SELECT totp_secret FROM agents WHERE id = $1", [auth.agent.id]);
  const secret = rows[0]?.totp_secret;
  if (!secret) {
    return NextResponse.json({ error: "No authenticator setup in progress — request a new QR code first." }, { status: 400 });
  }

  if (!verifyTotp(secret, code)) {
    return NextResponse.json({ error: "That code doesn't match — check the time on your phone and try the current code." }, { status: 400 });
  }

  await pool.query("UPDATE agents SET totp_confirmed_at = now(), two_factor_enabled = TRUE WHERE id = $1", [auth.agent.id]);
  return NextResponse.json({ ok: true });
}
