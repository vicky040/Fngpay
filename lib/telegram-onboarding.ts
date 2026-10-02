import type { PoolClient } from "pg";
import { pool } from "./db";
import { CREDITABLE_STATUSES, TERMINAL_FAILURE_STATUSES } from "./nowpayments";
import { sendTelegramMessage } from "./telegram";

// Excludes visually-ambiguous characters (0/O, 1/I/L) since agent codes get
// read off a phone screen and typed back in by hand.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function generateAgentCode(client: PoolClient): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = "";
    for (let i = 0; i < 6; i++) suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    const code = `PV-${suffix}`;
    const { rows } = await client.query(
      "SELECT 1 FROM agents WHERE agent_code = $1 UNION SELECT 1 FROM telegram_onboarding_sessions WHERE agent_code = $1",
      [code]
    );
    if (rows.length === 0) return code;
  }
  throw new Error("Could not generate a unique agent code after 20 attempts");
}

// Mirrors lib/deposit-sessions.ts's applyProviderStatus: shared by the IPN
// webhook and safe to call more than once for the same payment.
// credited_at guards against minting two different agent codes for one
// payment if a webhook retries.
export async function applyOnboardingPaymentStatus(sessionId: number, providerStatus: string, actuallyPaid?: number | string | null) {
  void actuallyPaid; // the onboarding fee is a fixed 200 USDT, nothing to reconcile it against

  console.log("📝 applyOnboardingPaymentStatus called:", { sessionId, providerStatus, actuallyPaid });

  const client = await pool.connect();
  let notify: { chatId: string; agentCode: string } | null = null;
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT chat_id, credited_at, status, agent_code FROM telegram_onboarding_sessions WHERE id = $1 FOR UPDATE",
      [sessionId]
    );
    if (rows.length === 0) {
      console.log("⚠️ Session not found:", sessionId);
      await client.query("ROLLBACK");
      return;
    }
    const session = rows[0];

    console.log("📋 Current session state:", session);

    let status = session.status;
    if (CREDITABLE_STATUSES.has(providerStatus)) {
      console.log("✅ Provider status is creditable:", providerStatus);
      status = "completed";
    } else if (TERMINAL_FAILURE_STATUSES.has(providerStatus)) {
      console.log("❌ Provider status is terminal failure:", providerStatus);
      status = "failed";
    } else {
      console.log("⏳ Provider status is pending:", providerStatus);
    }

    await client.query(
      "UPDATE telegram_onboarding_sessions SET provider_status = $1, status = $2, updated_at = now() WHERE id = $3",
      [providerStatus, status, sessionId]
    );

    console.log("💾 Updated session status to:", status);

    if (CREDITABLE_STATUSES.has(providerStatus) && !session.credited_at) {
      console.log("🎟️ Generating new agent code...");
      const agentCode = await generateAgentCode(client);
      console.log("✅ Generated agent code:", agentCode);

      await client.query("UPDATE telegram_onboarding_sessions SET agent_code = $1, credited_at = now() WHERE id = $2", [
        agentCode,
        sessionId,
      ]);

      console.log("💾 Saved agent code to database");
      notify = { chatId: session.chat_id, agentCode };
    } else if (CREDITABLE_STATUSES.has(providerStatus) && session.credited_at) {
      console.log("⚠️ Session already credited at:", session.credited_at);
      console.log("   Existing agent code:", session.agent_code);
    } else {
      console.log("⏸️ Not generating agent code - status not creditable or already credited");
    }

    await client.query("COMMIT");
    console.log("✅ Transaction committed");
  } catch (err) {
    console.error("❌ Error in applyOnboardingPaymentStatus:", err);
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  if (notify) {
    console.log("📤 Sending Telegram message to chat:", notify.chatId);
    try {
      await sendTelegramMessage(
        notify.chatId,
        `✅ Payment confirmed!\n\nYour Agent ID is: <b>${notify.agentCode}</b>\n\nGo back to the site and register using this Agent ID along with your email and mobile number, then complete Authenticator setup.`
      );
      console.log("✅ Telegram message sent successfully");
    } catch (err) {
      // The DB already has the agent code recorded — worst case the person
      // asks the bot again and gets the "you already have a code" reply.
      console.error("❌ Failed to notify Telegram chat of new agent code:", err);
    }
  } else {
    console.log("ℹ️ No notification to send");
  }
}
