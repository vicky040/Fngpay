import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashSecret } from "@/lib/auth";
import { createSession } from "@/lib/session";
import { provisionNewAgent } from "@/lib/agents";
import { isTelegramConfigured } from "@/lib/telegram";

export async function POST(request: Request) {
  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const agentCode = String(body.agentCode ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const mobile = String(body.mobile ?? "").trim();
  const telegramId = String(body.telegramId ?? "").trim();
  const password = String(body.password ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");
  const pin = String(body.pin ?? "");
  const confirmPin = String(body.confirmPin ?? "");

  if (!fullName || !agentCode || !email || !mobile || !telegramId || !password || !pin) {
    return NextResponse.json({ error: "All required fields must be filled in." }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Login password and confirmation don't match." }, { status: 400 });
  }
  if (pin !== confirmPin) {
    return NextResponse.json({ error: "Transaction PIN and confirmation don't match." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Login password must be at least 8 characters." }, { status: 400 });
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return NextResponse.json({ error: "Transaction PIN must be 4-6 digits." }, { status: 400 });
  }

  const existing = await pool.query("SELECT id FROM agents WHERE agent_code = $1 OR email = $2", [agentCode, email]);
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "An account with that Agent ID or email already exists." }, { status: 409 });
  }

  const passwordHash = await hashSecret(password);
  const pinHash = await hashSecret(pin);

  const client = await pool.connect();
  let agentId: number;
  try {
    await client.query("BEGIN");

    // Once the Telegram bot is live, an Agent ID only exists because someone
    // paid the onboarding fee and the bot minted it — so registering with
    // one has to prove that, not just guess a code. Skip while the bot
    // isn't configured yet, so the demo/dev flow keeps working unchanged.
    if (isTelegramConfigured()) {
      const { rows: onboarding } = await client.query(
        "SELECT id FROM telegram_onboarding_sessions WHERE agent_code = $1 AND status = 'completed' AND claimed_at IS NULL FOR UPDATE",
        [agentCode]
      );
      if (onboarding.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "That Agent ID hasn't been issued yet — message our Telegram bot and complete the onboarding payment first." },
          { status: 400 }
        );
      }
      await client.query("UPDATE telegram_onboarding_sessions SET claimed_at = now() WHERE id = $1", [onboarding[0].id]);
    }

    agentId = await provisionNewAgent(client, { agentCode, fullName, email, mobile, telegramId, passwordHash, pinHash });
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  await createSession(agentId);
  return NextResponse.json({ ok: true });
}
