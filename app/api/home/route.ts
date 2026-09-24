import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDate, formatInr } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [walletResult, entriesResult] = await Promise.all([
    pool.query<{
      balance_usdt: string;
      today_payin_inr: string;
      today_payout_inr: string;
      today_earning_inr: string;
      security_deposit_completed: boolean;
      agent_code: string;
    }>(
      `SELECT w.balance_usdt, w.today_payin_inr, w.today_payout_inr, w.today_earning_inr, a.security_deposit_completed, a.agent_code
       FROM wallets w JOIN agents a ON a.id = w.agent_id
       WHERE w.agent_id = $1`,
      [agentId]
    ),
    pool.query<{ kind: string; sub: string; amount: string; occurred_at: Date }>(
      `SELECT kind, sub, amount, occurred_at
       FROM wallet_entries
       WHERE agent_id = $1
       ORDER BY occurred_at DESC
       LIMIT 2`,
      [agentId]
    ),
  ]);

  const w = walletResult.rows[0];

  // PV-ADMIN and PV-ADMIN1 have 20,000 USDT deposit, others have 2,000 USDT
  const isDemoAccount = w.agent_code === 'PV-ADMIN' || w.agent_code === 'PV-ADMIN1';
  const depositAmount = isDemoAccount ? '20,000 USDT' : '2,000 USDT';

  const stats = [
    { label: "Security deposit", value: w.security_deposit_completed ? `${depositAmount} ✅ Completed` : "Not completed yet" },
    { label: "Today's payin", value: formatInr(Number(w.today_payin_inr)) },
    { label: "Today's payout", value: formatInr(Number(w.today_payout_inr)) },
    { label: "Today's earning", value: formatInr(Number(w.today_earning_inr)) },
  ];

  const entries = entriesResult.rows.map((e) => ({
    kind: e.kind,
    sub: e.sub,
    amount: e.amount,
    day: formatEntryDate(new Date(e.occurred_at)),
  }));

  return NextResponse.json({ stats, entries });
}
