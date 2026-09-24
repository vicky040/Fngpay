import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { createPayment, isNowPaymentsConfigured } from "@/lib/nowpayments";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  if (!isNowPaymentsConfigured()) {
    return NextResponse.json(
      { error: "Deposits aren't configured yet — see .env for the two NOWPayments values it needs." },
      { status: 501 }
    );
  }

  const body = await request.json();
  const amountInr = Number(body.amountInr);

  // Minimum deposit: 20,000 USDT (at 104 INR/USDT = ₹20,80,000)
  const MIN_DEPOSIT_INR = 2080000; // ₹20.8 lakhs

  if (!Number.isFinite(amountInr) || amountInr < MIN_DEPOSIT_INR) {
    return NextResponse.json({
      error: `Minimum deposit is ₹${MIN_DEPOSIT_INR.toLocaleString('en-IN')} (20,000 USDT at 104 INR/USDT).`
    }, { status: 400 });
  }

  const origin = new URL(request.url).origin;
  const orderId = `PV-DEP-${auth.agent.id}-${Date.now()}`;

  let payment;
  try {
    payment = await createPayment({
      priceAmount: amountInr,
      priceCurrency: "inr",
      orderId,
      orderDescription: `Add funds — ${auth.agent.agentCode}`,
      ipnCallbackUrl: `${origin}/api/funds/webhook`,
    });
  } catch (err) {
    console.error("NOWPayments createPayment failed:", err);
    return NextResponse.json({ error: "Couldn't start a deposit right now — please try again shortly." }, { status: 502 });
  }

  // Only one session should read as "active" at a time — superseding old
  // ones keeps the Funds screen's "resume" card pointed at the latest.
  await pool.query(
    "UPDATE deposit_sessions SET status = 'expired', updated_at = now() WHERE agent_id = $1 AND status = 'active'",
    [auth.agent.id]
  );

  const { rows } = await pool.query(
    `INSERT INTO deposit_sessions (agent_id, payment_id, order_id, pay_currency, pay_address, pay_amount, price_amount, price_currency, provider_status, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active')
     RETURNING id`,
    [
      auth.agent.id,
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

  const qrDataUri = await QRCode.toDataURL(payment.pay_address, { margin: 1, width: 220 });

  return NextResponse.json({
    sessionId: rows[0].id,
    payAddress: payment.pay_address,
    payAmount: payment.pay_amount,
    payCurrency: payment.pay_currency,
    priceAmount: payment.price_amount,
    priceCurrency: payment.price_currency,
    status: payment.payment_status,
    qrDataUri,
  });
}
