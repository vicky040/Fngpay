import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyIpnSignature, isNowPaymentsConfigured } from "@/lib/nowpayments";
import { applyProviderStatus } from "@/lib/deposit-sessions";

// Called by NOWPayments' servers directly, not the browser — there's no
// session cookie to check here. The HMAC signature (verified below) *is*
// this endpoint's authentication; without a correct signature, the request
// is rejected before it can touch any wallet balance.
export async function POST(request: Request) {
  if (!isNowPaymentsConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 501 });
  }

  const body = await request.json();
  const signature = request.headers.get("x-nowpayments-sig");

  if (!verifyIpnSignature(body, signature)) {
    console.warn("Rejected NOWPayments webhook with invalid signature", { paymentId: body?.payment_id });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const paymentId = String(body.payment_id ?? "");
  const providerStatus = String(body.payment_status ?? "");
  const actuallyPaid = body.actually_paid;

  const { rows } = await pool.query("SELECT id FROM deposit_sessions WHERE payment_id = $1", [paymentId]);
  if (rows.length === 0) {
    // Not one of ours (or already deleted) — acknowledge anyway so
    // NOWPayments stops retrying a webhook we'll never be able to match.
    return NextResponse.json({ ok: true });
  }

  await applyProviderStatus(rows[0].id, providerStatus, actuallyPaid);
  return NextResponse.json({ ok: true });
}
