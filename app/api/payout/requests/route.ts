import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime } from "@/lib/format";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  try {
    // Get withdrawal requests (pending, approved, rejected)
    const result = await pool.query<{
      id: number;
      amount_usdt: string;
      amount_inr: string;
      exchange_rate: string;
      status: string;
      bank_name: string;
      account_number_last4: string;
      created_at: Date;
      approved_at: Date | null;
      rejected_at: Date | null;
      completed_at: Date | null;
      rejection_reason: string | null;
    }>(
      `SELECT
        po.id,
        po.amount_usdt,
        po.amount_inr,
        po.exchange_rate,
        po.status,
        lb.bank_name,
        lb.account_number_last4,
        po.created_at,
        po.approved_at,
        po.rejected_at,
        po.completed_at,
        po.rejection_reason
      FROM payout_orders po
      LEFT JOIN linked_banks lb ON lb.id = po.linked_bank_id
      WHERE po.agent_id = $1
      ORDER BY po.created_at DESC`,
      [auth.agent.id]
    );

    const requests = result.rows.map((r) => ({
      id: r.id,
      amountUsdt: Number(r.amount_usdt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountInr: Math.round(Number(r.amount_inr)).toLocaleString('en-IN'),
      exchangeRate: r.exchange_rate,
      status: r.status,
      bankName: r.bank_name,
      accountLast4: r.account_number_last4,
      createdAt: formatEntryDateTime(new Date(r.created_at)),
      approvedAt: r.approved_at ? formatEntryDateTime(new Date(r.approved_at)) : null,
      rejectedAt: r.rejected_at ? formatEntryDateTime(new Date(r.rejected_at)) : null,
      completedAt: r.completed_at ? formatEntryDateTime(new Date(r.completed_at)) : null,
      rejectionReason: r.rejection_reason,
    }));

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Withdrawal requests API error:', error);
    // Return empty array if table doesn't exist yet
    return NextResponse.json({ requests: [] });
  }
}
