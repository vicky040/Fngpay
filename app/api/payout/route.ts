import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime, formatInr, formatUsdt } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [walletResult, ordersResult] = await Promise.all([
    pool.query<{ balance_usdt: string; fixed_rate_inr: string }>(
      "SELECT balance_usdt, fixed_rate_inr FROM wallets WHERE agent_id = $1",
      [agentId]
    ),
    pool.query<{ amount: string; status: string; created_at: Date }>(
      "SELECT amount, status, created_at FROM payout_orders WHERE agent_id = $1 ORDER BY created_at DESC",
      [agentId]
    ),
  ]);

  const balance = Number(walletResult.rows[0]?.balance_usdt ?? 0);
  const rate = Number(walletResult.rows[0]?.fixed_rate_inr ?? 0);

  const orders = ordersResult.rows.map((r) => ({ amount: r.amount, status: r.status, date: formatEntryDateTime(new Date(r.created_at)) }));

  return NextResponse.json({
    wallet: {
      balanceLabel: formatUsdt(balance),
      approxInrLabel: formatInr(balance * rate),
      fixedRateLabel: `Fixed rate: ${formatInr(rate)} / USDT`,
    },
    orders,
  });
}
