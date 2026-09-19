import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const [linkedResult, providersResult] = await Promise.all([
    pool.query<{ bank_name: string; bank_short: string; account_number_last4: string }>(
      "SELECT bank_name, bank_short, account_number_last4 FROM linked_banks WHERE agent_id = $1 ORDER BY created_at DESC",
      [auth.agent.id]
    ),
    pool.query<{ name: string; mark: string; locked: boolean }>("SELECT name, mark, locked FROM upi_providers ORDER BY sort_order"),
  ]);

  return NextResponse.json({
    linkedBanks: linkedResult.rows.map((r) => ({ name: r.bank_name, short: r.bank_short, last4: r.account_number_last4 })),
    upiProviders: providersResult.rows,
  });
}
