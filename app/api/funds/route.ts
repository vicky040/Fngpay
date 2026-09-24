import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatInr } from "@/lib/format";
import { isNowPaymentsConfigured } from "@/lib/nowpayments";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [agentResult, sessionResult, exchangeRateResult] = await Promise.all([
    pool.query<{ security_deposit_completed: boolean }>("SELECT security_deposit_completed FROM agents WHERE id = $1", [agentId]),
    pool.query<{ id: number; pay_address: string; pay_amount: string; price_amount: string; provider_status: string }>(
      "SELECT id, pay_address, pay_amount, price_amount, provider_status FROM deposit_sessions WHERE agent_id = $1 AND status = 'active' ORDER BY created_at DESC LIMIT 1",
      [agentId]
    ),
    // Get exchange rate from system_settings (updated by admin)
    pool.query<{ value: string }>("SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'"),
  ]);

  const rate = Number(exchangeRateResult.rows[0]?.value ?? 104);
  const activeSession = sessionResult.rows[0];

  return NextResponse.json({
    fixedRateLabel: `${formatInr(rate)} / USDT`,
    securityDepositCompleted: agentResult.rows[0]?.security_deposit_completed ?? false,
    depositsConfigured: isNowPaymentsConfigured(),
    activeSession: activeSession
      ? {
          id: activeSession.id,
          payAddress: activeSession.pay_address,
          payAmount: activeSession.pay_amount,
          priceAmount: activeSession.price_amount,
          providerStatus: activeSession.provider_status,
        }
      : null,
  });
}
