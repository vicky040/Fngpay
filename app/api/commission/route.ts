import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatInr } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [ratesResult, metricsResult, weeklyResult] = await Promise.all([
    pool.query<{ label: string; value: string; note: string }>("SELECT label, value, note FROM commission_rates ORDER BY sort_order"),
    pool.query<{ label: string; value: string }>(
      "SELECT label, value FROM commission_metrics WHERE agent_id = $1 ORDER BY sort_order",
      [agentId]
    ),
    pool.query<{ day: string; payin_pct: number; payout_pct: number; agent_pct: number }>(
      "SELECT day, payin_pct, payout_pct, agent_pct FROM commission_weekly WHERE agent_id = $1 ORDER BY sort_order",
      [agentId]
    ),
  ]);

  // Get exchange rate from system_settings (fallback to 104 if not exists)
  let rate = 104;
  try {
    const exchangeRateResult = await pool.query<{ value: string }>(
      "SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'"
    );
    rate = Number(exchangeRateResult.rows[0]?.value ?? 104);
  } catch (e) {
    // system_settings table doesn't exist yet, use default
    console.log('system_settings table not found, using default rate 104');
  }

  return NextResponse.json({
    fixedRateLabel: `${formatInr(rate)} / USDT`,
    rates: ratesResult.rows,
    metrics: metricsResult.rows,
    week: weeklyResult.rows.map((w) => ({
      day: w.day,
      payin: `${w.payin_pct}%`,
      payout: `${w.payout_pct}%`,
      agent: `${w.agent_pct}%`,
    })),
  });
}
