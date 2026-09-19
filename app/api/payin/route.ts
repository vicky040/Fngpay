import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{ amount: string; status: string; created_at: Date }>(
    "SELECT amount, status, created_at FROM payin_orders WHERE agent_id = $1 ORDER BY created_at DESC",
    [auth.agent.id]
  );

  const orders = rows.map((r) => ({ amount: r.amount, status: r.status, date: formatEntryDateTime(new Date(r.created_at)) }));
  return NextResponse.json({ orders });
}
