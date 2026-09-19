import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatInr } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [ratesResult, metricsResult, weeklyResult, walletResult] = await Promise.all([
    pool.query<{ label: string; value: string; note: string }>("SELECT label, value, note FROM commission_rates ORDER BY sort_order"),
    pool.query<{ label: string; value: string }>(
      "SELECT label, value FROM commission_metrics WHERE agent_id = $1 ORDER BY sort_order",
      [agentId]
    ),
    pool.query<{ day: string; payin_pct: number; payout_pct: number; agent_pct: number }>(
      "SELECT day, payin_pct, payout_pct, agent_pct FROM commission_weekly WHERE agent_id = $1 ORDER BY sort_order",
      [agentId]
    ),
    pool.query<{ fixed_rate_inr: string }>("SELECT fixed_rate_inr FROM wallets WHERE agent_id = $1", [agentId]),
  ]);

  const rate = Number(walletResult.rows[0]?.fixed_rate_inr ?? 0);

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
