import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifySecret } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { verifyTotp } from "@/lib/totp";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = String(body.identifier ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const otp = String(body.otp ?? "").trim();

  if (!identifier || !password) {
    return NextResponse.json({ error: "Agent ID / email and password are required." }, { status: 400 });
  }

  const { rows } = await pool.query(
    "SELECT id, password_hash, totp_secret, two_factor_enabled FROM agents WHERE lower(agent_code) = $1 OR email = $1",
    [identifier]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }
  if (!rows[0].password_hash) {
    return NextResponse.json({ error: "This account was created with Google Sign-In — use the Continue with Google button instead." }, { status: 401 });
  }

  const valid = await verifySecret(password, rows[0].password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  // Real RFC 6238 verification once the account has completed authenticator
  // setup. Accounts that haven't finished setup yet fall through to the
  // forced /authenticator-setup step right after this — see requireAgent().
  if (rows[0].two_factor_enabled && rows[0].totp_secret) {
    // 2FA is enabled - require OTP
    if (!otp) {
      return NextResponse.json({ error: "Authenticator code is required." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Authenticator code must be 6 digits." }, { status: 400 });
    }
    if (!verifyTotp(rows[0].totp_secret, otp)) {
      return NextResponse.json({ error: "Invalid authenticator code." }, { status: 401 });
    }
  }

  await createSession(rows[0].id);
  return NextResponse.json({ ok: true });
}
