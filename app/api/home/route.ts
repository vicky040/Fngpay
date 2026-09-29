import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDate, formatInr } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  const [walletResult, entriesResult, totalsResult] = await Promise.all([
    pool.query<{
      balance_usdt: string;
      security_deposit_completed: boolean;
      agent_code: string;
    }>(
      `SELECT w.balance_usdt, a.security_deposit_completed, a.agent_code
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
    pool.query<{ kind: string; total: string }>(
      `SELECT
        kind,
        SUM(CAST(REGEXP_REPLACE(amount, '[^0-9.-]', '', 'g') AS NUMERIC)) as total
       FROM wallet_entries
       WHERE agent_id = $1
       GROUP BY kind`,
      [agentId]
    ),
  ]);

  const w = walletResult.rows[0];

  // PV-ADMIN and PV-ADMIN1 have 20,000 USDT deposit, others have 2,000 USDT
  const isDemoAccount = w.agent_code === 'PV-ADMIN' || w.agent_code === 'PV-ADMIN1';
  const depositAmount = isDemoAccount ? '20,000 USDT' : '2,000 USDT';

  // Calculate totals from wallet_entries
  const totals = {
    payin: 0,
    payout: 0,
    earning: 0,
  };

  console.log('DEBUG - totalsResult.rows:', JSON.stringify(totalsResult.rows));

  totalsResult.rows.forEach(row => {
    const amount = Math.abs(parseFloat(row.total));
    console.log(`DEBUG - Processing: kind=${row.kind}, total=${row.total}, parsed=${amount}`);
    if (row.kind === 'DEPOSIT') {
      totals.payin = amount;
    } else if (row.kind === 'WITHDRAWAL') {
      totals.payout = amount;
    } else if (row.kind === 'ADJUSTMENT') {
      totals.earning = amount;
    }
  });

  // Get exchange rate (default 104 INR/USDT)
  const exchangeRate = 104;

  console.log('DEBUG - Final totals:', totals);
  console.log('DEBUG - After conversion:', {
    payin: totals.payin * exchangeRate,
    payout: totals.payout * exchangeRate,
    earning: totals.earning * exchangeRate
  });

  const stats = [
    { label: "Security deposit", value: w.security_deposit_completed ? `${depositAmount} ✅ Completed` : "Not completed yet" },
    { label: "Total payin", value: formatInr(totals.payin * exchangeRate) },
    { label: "Total payout", value: formatInr(totals.payout * exchangeRate) },
    { label: "Total earning", value: formatInr(totals.earning * exchangeRate) },
  ];

  const entries = entriesResult.rows.map((e) => ({
    kind: e.kind,
    sub: e.sub,
    amount: e.amount,
    day: formatEntryDate(new Date(e.occurred_at)),
  }));

  return NextResponse.json({ stats, entries });
}
