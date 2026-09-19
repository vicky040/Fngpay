import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyIpnSignature, isNowPaymentsConfigured } from "@/lib/nowpayments";
import { applyOnboardingPaymentStatus } from "@/lib/telegram-onboarding";

// NOWPayments' IPN target for onboarding-fee payments (separate from
// /api/funds/webhook, which is scoped to deposits against an existing
// agent's wallet — onboarding payments happen before any account exists).
// No session cookie here either; the HMAC signature is the only auth.
export async function POST(request: Request) {
  if (!isNowPaymentsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 501 });
  }

  const body = await request.json();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(body, signature)) {
    console.warn("Rejected NOWPayments onboarding webhook with invalid signature", { paymentId: body?.payment_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const paymentId = String(body.payment_id ?? "");
  const providerStatus = String(body.payment_status ?? "");
  const actuallyPaid = body.actually_paid;

  const { rows } = await pool.query("SELECT id FROM telegram_onboarding_sessions WHERE payment_id = $1", [paymentId]);
  if (rows.length === 0) {
    return NextResponse.json({ ok: true });
  }

  await applyOnboardingPaymentStatus(rows[0].id, providerStatus, actuallyPaid);
  return NextResponse.json({ ok: true });
}
