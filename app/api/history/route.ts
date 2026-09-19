import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { formatEntryDateTime, formatUsdt } from "@/lib/format";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const [entriesResult, walletResult] = await Promise.all([
    pool.query<{
      kind: string;
      entry_type: string;
      sub: string;
      occurred_at: Date;
      amount: string;
      balance: string;
    }>(
      `SELECT kind, entry_type, sub, occurred_at, amount, balance
       FROM wallet_entries
       WHERE agent_id = $1
       ORDER BY occurred_at DESC`,
      [auth.agent.id]
    ),
    pool.query<{ balance_usdt: string }>("SELECT balance_usdt FROM wallets WHERE agent_id = $1", [auth.agent.id]),
  ]);

  const entries = entriesResult.rows.map((r) => ({
    kind: r.kind,
    type: r.entry_type,
    sub: r.sub,
    date: formatEntryDateTime(new Date(r.occurred_at)),
    amount: r.amount,
    bal: r.balance,
  }));

  const balanceLabel = formatUsdt(Number(walletResult.rows[0]?.balance_usdt ?? 0));

  return NextResponse.json({ entries, balanceLabel });
}
