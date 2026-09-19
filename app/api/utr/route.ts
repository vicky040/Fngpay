import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatIsoDate } from "@/lib/format";

const TONE_BY_STATUS: Record<string, string> = {
  Matched: "green",
  Pending: "amber",
  Unmatched: "red",
};

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{ utr: string; bank: string; amount: string; status: string; occurred_at: Date }>(
    "SELECT utr, bank, amount, status, occurred_at FROM utr_records WHERE agent_id = $1 ORDER BY occurred_at DESC",
    [auth.agent.id]
  );

  const records = rows.map((r) => ({
    utr: r.utr,
    bank: r.bank,
    amount: r.amount,
    status: r.status,
    tone: TONE_BY_STATUS[r.status] ?? "neutral",
    date: formatIsoDate(new Date(r.occurred_at)),
  }));

  return NextResponse.json({ records });
}
