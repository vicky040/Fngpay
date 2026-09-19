import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { getPaymentStatus, isNowPaymentsConfigured } from "@/lib/nowpayments";
import { applyProviderStatus } from "@/lib/deposit-sessions";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const { id } = await params;

  const { rows } = await pool.query(
    "SELECT id, agent_id, payment_id, pay_address, pay_amount, pay_currency, price_amount, price_currency, provider_status, status FROM deposit_sessions WHERE id = $1",
    [id]
  );
  if (rows.length === 0 || rows[0].agent_id !== auth.agent.id) {
    return NextResponse.json({ error: "Deposit session not found." }, { status: 404 });
  }
  const session = rows[0];

  // Only worth polling NOWPayments while the payment can still change state
  // — a webhook that already landed (or a previous poll) makes this a
  // no-op read of what we already recorded.
  if (session.status === "active" && isNowPaymentsConfigured()) {
    try {
      const live = await getPaymentStatus(session.payment_id);
      if (live.payment_status !== session.provider_status) {
        await applyProviderStatus(session.id, live.payment_status, live.pay_amount);
      }
    } catch (err) {
      console.error("NOWPayments status poll failed:", err);
      // Fall through and return the last-known DB state rather than failing
      // the request — the webhook may still land independently.
    }
  }

  const { rows: freshRows } = await pool.query(
    "SELECT pay_address, pay_amount, pay_currency, price_amount, price_currency, provider_status, status FROM deposit_sessions WHERE id = $1",
    [id]
  );
  const fresh = freshRows[0];
  const qrDataUri = fresh.pay_address ? await QRCode.toDataURL(fresh.pay_address, { margin: 1, width: 220 }) : null;

  return NextResponse.json({ ...fresh, qrDataUri });
}
