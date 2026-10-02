import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyIpnSignature, isNowPaymentsConfigured } from "@/lib/nowpayments";
import { applyOnboardingPaymentStatus } from "@/lib/telegram-onboarding";

// NOWPayments' IPN target for onboarding-fee payments (separate from
// /api/funds/webhook, which is scoped to deposits against an existing
// agent's wallet — onboarding payments happen before any account exists).
// No session cookie here either; the HMAC signature is the only auth.
export async function POST(request: Request) {
  console.log("🔔 Telegram payment webhook received");

  if (!isNowPaymentsConfigured()) {
    console.error("❌ NOWPayments not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 501 });
  }

  const body = await request.json();
  const signature = request.headers.get("x-nowpayments-sig");

  console.log("📦 Webhook payload:", JSON.stringify(body, null, 2));
  console.log("🔑 Signature:", signature);

  if (!verifyIpnSignature(body, signature)) {
    console.warn("❌ Rejected NOWPayments onboarding webhook with invalid signature", { paymentId: body?.payment_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  console.log("✅ Signature verified");

  const paymentId = String(body.payment_id ?? "");
  const providerStatus = String(body.payment_status ?? "");
  const actuallyPaid = body.actually_paid;

  console.log("💳 Payment details:", { paymentId, providerStatus, actuallyPaid });

  const { rows } = await pool.query("SELECT id, chat_id FROM telegram_onboarding_sessions WHERE payment_id = $1", [paymentId]);
  if (rows.length === 0) {
    console.log("⚠️ No session found for payment_id:", paymentId);
    return NextResponse.json({ ok: true });
  }

  console.log("📋 Found session:", rows[0]);
  console.log("🔄 Applying payment status...");

  await applyOnboardingPaymentStatus(rows[0].id, providerStatus, actuallyPaid);

  console.log("✅ Payment status applied successfully");
  return NextResponse.json({ ok: true });
}
