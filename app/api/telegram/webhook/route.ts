import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { sendTelegramMessage, sendTelegramPhoto, verifyTelegramSecret, isTelegramConfigured } from "@/lib/telegram";
import { createPayment, isNowPaymentsConfigured } from "@/lib/nowpayments";

const ONBOARDING_FEE_USDT = 200;
const WEBSITE_URL = "https://fngpay.vercel.app";
// Production mode active - Last updated: 2026-09-24

const WELCOME = `🎯 <b>Welcome to FNGPAY Partner Panel!</b>

Thank you for your interest in becoming a Partner Agent. We're excited to have you join our P2P payment network.

━━━━━━━━━━━━━━━━━━━━
<b>📋 ONBOARDING PROCESS</b>
━━━━━━━━━━━━━━━━━━━━

<b>Step 1️⃣:</b> Security Deposit
Pay ${ONBOARDING_FEE_USDT} USDT (TRC20 Network)
→ This amount will be credited to your panel wallet

<b>Step 2️⃣:</b> Automatic Confirmation
Your payment is verified automatically
→ No screenshots or TXID needed

<b>Step 3️⃣:</b> Registration
Visit: ${WEBSITE_URL}/register
→ Use your Agent ID, Email & Mobile Number
→ Set up 2FA Authenticator

<b>Step 4️⃣:</b> Activate Panel
Complete 2,000 USDT security deposit
→ Full access to partner features

<b>Step 5️⃣:</b> Start Earning
Add your bank accounts & UPI IDs
→ Begin receiving Payin/Payout orders

━━━━━━━━━━━━━━━━━━━━
<b>🌐 Website:</b> ${WEBSITE_URL}
<b>💰 Onboarding Fee:</b> ${ONBOARDING_FEE_USDT} USDT (TRC20)
<b>⚡ Processing:</b> Instant Confirmation
━━━━━━━━━━━━━━━━━━━━

<i>Generating your payment address now...</i>
I'll notify you instantly when your payment is confirmed! ✅`;

// Called by Telegram for every message sent to the bot. Telegram expects a
// fast 2xx response regardless of outcome, so failures here are logged and
// swallowed rather than surfaced as error statuses (a non-2xx just makes
// Telegram retry the same update later, which would re-send the welcome
// text / re-create a payment for someone who already has one pending).
// Updated: 2026-09-22
export async function POST(request: Request) {
  console.log("🔔 Telegram webhook called!");

  if (!verifyTelegramSecret(request)) {
    console.log("❌ Invalid secret");
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  console.log("✅ Telegram is configured:", isTelegramConfigured());
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const update = await request.json();
  console.log("📥 Received update:", JSON.stringify(update, null, 2));
  const message = update.message;
  if (!message?.chat?.id || typeof message.text !== "string") {
    console.log("⚠️ No valid message found in update");
    return NextResponse.json({ ok: true });
  }

  const chatId: number = message.chat.id;
  const username: string | null = message.from?.username ?? null;
  console.log(`💬 Processing message from chatId: ${chatId}, username: ${username}`);

  try {
    console.log("🔍 Checking for active payment sessions...");
    const { rows: activeRows } = await pool.query(
      "SELECT id FROM telegram_onboarding_sessions WHERE chat_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [chatId]
    );
    if (activeRows.length > 0) {
      console.log("⏳ User has active payment, sending reminder");
      await sendTelegramMessage(
        chatId,
        `Still waiting for your ${ONBOARDING_FEE_USDT} USDT payment — send it to the address I shared and I'll confirm automatically the moment it lands.`
      );
      return NextResponse.json({ ok: true });
    }

    console.log("🔍 Checking for completed sessions...");
    const { rows: completedRows } = await pool.query(
      "SELECT agent_code FROM telegram_onboarding_sessions WHERE chat_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1",
      [chatId]
    );
    if (completedRows.length > 0 && completedRows[0].agent_code) {
      console.log("✅ User already has agent code:", completedRows[0].agent_code);
      await sendTelegramMessage(
        chatId,
        `You already have an Agent ID: <b>${completedRows[0].agent_code}</b>\n\nHead back to the site's Register page and use it there.`
      );
      return NextResponse.json({ ok: true });
    }

    console.log("👋 New user, sending welcome message...");
    await sendTelegramMessage(chatId, WELCOME);
    console.log("✅ Welcome message sent!");

    // PRODUCTION MODE: Real payments enabled with NOWPayments
    const TEST_MODE = false; // DISABLED - NOWPayments account is now configured ✅

    if (TEST_MODE) {
      console.log("🧪 TEST MODE: Generating agent code without payment");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const { generateAgentCode } = await import("@/lib/telegram-onboarding");
        const agentCode = await generateAgentCode(client);

        await client.query(
          `INSERT INTO telegram_onboarding_sessions
           (chat_id, telegram_username, agent_code, payment_id, order_id, pay_currency, price_amount, price_currency, provider_status, status, credited_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
          [chatId, username, agentCode, 'TEST-' + Date.now(), 'TEST-' + chatId, 'usdttrc20', 200, 'usdttrc20', 'finished', 'completed']
        );

        await client.query("COMMIT");

        await sendTelegramMessage(
          chatId,
          `✅ Your Agent ID is: <b>${agentCode}</b>\n\nGo to https://fngpay.vercel.app/register and use this Agent ID to create your account!\n\n⚠️ This is TEST MODE - no payment required for testing.`
        );

        console.log("✅ Test agent code generated:", agentCode);
        return NextResponse.json({ ok: true });
      } catch (err) {
        await client.query("ROLLBACK");
        console.error("Test mode error:", err);
        throw err;
      } finally {
        client.release();
      }
    }

    if (!isNowPaymentsConfigured()) {
      await sendTelegramMessage(chatId, "⚠️ Payments aren't switched on yet on our end — please check back shortly.");
      return NextResponse.json({ ok: true });
    }

    const origin = new URL(request.url).origin;
    const orderId = `PV-ONB-${chatId}-${Date.now()}`;

    console.log("💳 Creating payment with NOWPayments...");
    console.log("Order ID:", orderId);
    console.log("Amount:", ONBOARDING_FEE_USDT, "USDT");
    console.log("IPN Callback:", `${origin}/api/telegram/payment-webhook`);

    let payment;
    try {
      payment = await createPayment({
        priceAmount: ONBOARDING_FEE_USDT,
        priceCurrency: "usdttrc20",
        orderId,
        orderDescription: "Fngpay P2P — partner panel onboarding fee",
        ipnCallbackUrl: `${origin}/api/telegram/payment-webhook`,
      });
      console.log("✅ Payment created successfully!");
      console.log("Payment ID:", payment.payment_id);
      console.log("Pay Address:", payment.pay_address);
      console.log("Pay Amount:", payment.pay_amount);
    } catch (err) {
      console.error("❌ NOWPayments createPayment failed:", err);

      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Error message:", errorMsg);

      await sendTelegramMessage(
        chatId,
        "Sorry, couldn't generate a payment address right now. Please contact support or try again in a minute."
      );
      return NextResponse.json({ ok: true });
    }

    await pool.query(
      `INSERT INTO telegram_onboarding_sessions (chat_id, telegram_username, payment_id, order_id, pay_currency, pay_address, pay_amount, price_amount, price_currency, provider_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')`,
      [
        chatId,
        username,
        payment.payment_id,
        orderId,
        payment.pay_currency,
        payment.pay_address,
        payment.pay_amount,
        payment.price_amount,
        payment.price_currency,
        payment.payment_status,
      ]
    );

    const qrDataUri = await QRCode.toDataURL(payment.pay_address, { margin: 1, width: 300 });
    await sendTelegramPhoto(
      chatId,
      qrDataUri,
      `🚀 Pay ${payment.pay_amount} USDT (TRC20) to:\n\n${payment.pay_address}\n\nI'll message you here the instant it's confirmed.`
    );
  } catch (err) {
    console.error("Telegram webhook handling failed:", err);
  }

  return NextResponse.json({ ok: true });
}
