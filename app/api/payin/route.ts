import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  try {
    // Query deposit_sessions for completed and pending deposits
    const { rows } = await pool.query<{
      id: number;
      pay_amount: string;
      pay_currency: string;
      price_amount: string;
      price_currency: string;
      provider_status: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT
        id,
        pay_amount,
        pay_currency,
        price_amount,
        price_currency,
        provider_status,
        status,
        created_at
      FROM deposit_sessions
      WHERE agent_id = $1
      ORDER BY created_at DESC`,
      [auth.agent.id]
    );

    const deposits = rows.map((r) => ({
      id: r.id,
      amountUsdt: Number(r.pay_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountInr: Number(r.price_amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
      status: r.status,
      providerStatus: r.provider_status,
      createdAt: formatEntryDateTime(new Date(r.created_at)),
    }));

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error('Payin API error:', error);
    return NextResponse.json(
      { error: 'Failed to load deposit history' },
      { status: 500 }
    );
  }
}
