import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{
    period_type: string;
    period_label: string;
    deposits: string;
    withdrawals: string;
    commission: string;
    net: string;
  }>(
    `SELECT period_type, period_label, deposits, withdrawals, commission, net
     FROM commission_reports
     WHERE agent_id = $1
     ORDER BY period_type, sort_order`,
    [auth.agent.id]
  );

  const grouped: Record<string, typeof rows> = { Daily: [], Weekly: [], Monthly: [] };
  for (const r of rows) {
    (grouped[r.period_type] ??= []).push(r);
  }

  const toRow = (r: (typeof rows)[number]) => ({
    period: r.period_label,
    deposits: r.deposits,
    withdrawals: r.withdrawals,
    commission: r.commission,
    net: r.net,
  });

  return NextResponse.json({
    Daily: grouped.Daily.map(toRow),
    Weekly: grouped.Weekly.map(toRow),
    Monthly: grouped.Monthly.map(toRow),
  });
}
