import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { sendTelegramMessage, sendTelegramPhoto, verifyTelegramSecret, isTelegramConfigured } from "@/lib/telegram";
import { createPayment, isNowPaymentsConfigured } from "@/lib/nowpayments";

const ONBOARDING_FEE_USDT = 200;

const WELCOME = `👋 Welcome to Fngpay P2P!

Thanks for reaching out about Partner Panel access. Here's the process:

1️⃣ Pay ${ONBOARDING_FEE_USDT} USDT (TRC20) — address below. This isn't an extra charge, it lands in your panel wallet once your account is live.
2️⃣ Your payment is confirmed automatically and I'll send your Agent ID right here, no screenshot or TXID needed.
3️⃣ Register on the site using your Email, Mobile Number and that Agent ID, then complete Authenticator setup.
4️⃣ Complete the 2,000 USDT security deposit to activate your panel.
5️⃣ Add your bank accounts / UPI IDs and start receiving Payin/Payout orders.

Sending your payment address now — I'll message you the moment it's confirmed.`;

// Called by Telegram for every message sent to the bot. Telegram expects a
// fast 2xx response regardless of outcome, so failures here are logged and
// swallowed rather than surfaced as error statuses (a non-2xx just makes
// Telegram retry the same update later, which would re-send the welcome
// text / re-create a payment for someone who already has one pending).
export async function POST(request: Request) {
  if (!verifyTelegramSecret(request)) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  if (!isTelegramConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const update = await request.json();
  const message = update.message;
  if (!message?.chat?.id || typeof message.text !== "string") {
    return NextResponse.json({ ok: true });
  }

  const chatId: number = message.chat.id;
  const username: string | null = message.from?.username ?? null;

  try {
    const { rows: activeRows } = await pool.query(
      "SELECT id FROM telegram_onboarding_sessions WHERE chat_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [chatId]
    );
    if (activeRows.length > 0) {
      await sendTelegramMessage(
        chatId,
        `Still waiting for your ${ONBOARDING_FEE_USDT} USDT payment — send it to the address I shared and I'll confirm automatically the moment it lands.`
      );
      return NextResponse.json({ ok: true });
    }

    const { rows: completedRows } = await pool.query(
      "SELECT agent_code FROM telegram_onboarding_sessions WHERE chat_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1",
      [chatId]
    );
    if (completedRows.length > 0 && completedRows[0].agent_code) {
      await sendTelegramMessage(
        chatId,
        `You already have an Agent ID: <b>${completedRows[0].agent_code}</b>\n\nHead back to the site's Register page and use it there.`
      );
      return NextResponse.json({ ok: true });
    }

    await sendTelegramMessage(chatId, WELCOME);

    if (!isNowPaymentsConfigured()) {
      await sendTelegramMessage(chatId, "⚠️ Payments aren't switched on yet on our end — please check back shortly.");
      return NextResponse.json({ ok: true });
    }

    const origin = new URL(request.url).origin;
    const orderId = `PV-ONB-${chatId}-${Date.now()}`;

    let payment;
    try {
      payment = await createPayment({
        priceAmount: ONBOARDING_FEE_USDT,
        priceCurrency: "usdttrc20",
        orderId,
        orderDescription: "Fngpay P2P — partner panel onboarding fee",
        ipnCallbackUrl: `${origin}/api/telegram/payment-webhook`,
      });
    } catch (err) {
      console.error("NOWPayments createPayment (onboarding) failed:", err);
      await sendTelegramMessage(chatId, "Sorry, couldn't generate a payment address right now — please try again in a minute.");
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
