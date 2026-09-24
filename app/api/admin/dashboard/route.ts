import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";
import { formatEntryDateTime } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    // Get current exchange rate (handle if table doesn't exist)
    let currentRate = "104";
    try {
      const rateResult = await pool.query<{ value: string }>(
        `SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'`
      );
      currentRate = rateResult.rows[0]?.value || "104";
    } catch (e) {
      console.log('system_settings table not found, using default rate 104');
    }

    // Get all withdrawal requests (pending first, then others)
    let withdrawals: Array<{
      id: number;
      agentCode: string;
      agentName: string;
      amountUsdt: string;
      amountInr: string;
      bankName: string;
      accountLast4: string;
      status: string;
      createdAt: string;
      rejectionReason?: string;
    }> = [];
    let pendingCount = 0;

    try {
      const withdrawalsResult = await pool.query<{
        id: number;
        agent_id: number;
        agent_code: string;
        full_name: string;
        amount_usdt: string;
        amount_inr: string;
        bank_name: string;
        account_number_last4: string;
        status: string;
        created_at: Date;
        rejection_reason: string | null;
      }>(
        `SELECT
          po.id,
          po.agent_id,
          a.agent_code,
          a.full_name,
          po.amount_usdt,
          po.amount_inr,
          lb.bank_name,
          lb.account_number_last4,
          po.status,
          po.created_at,
          po.rejection_reason
        FROM payout_orders po
        JOIN agents a ON a.id = po.agent_id
        JOIN linked_banks lb ON lb.id = po.linked_bank_id
        WHERE po.status IN ('pending', 'approved', 'rejected', 'completed')
        ORDER BY
          CASE po.status
            WHEN 'pending' THEN 1
            WHEN 'approved' THEN 2
            WHEN 'rejected' THEN 3
            WHEN 'completed' THEN 4
          END,
          po.created_at ASC`
      );

      withdrawals = withdrawalsResult.rows.map((w) => ({
        id: w.id,
        agentCode: w.agent_code,
        agentName: w.full_name,
        amountUsdt: Number(w.amount_usdt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        amountInr: Number(w.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
        bankName: w.bank_name,
        accountLast4: w.account_number_last4,
        status: w.status,
        createdAt: formatEntryDateTime(new Date(w.created_at)),
        rejectionReason: w.rejection_reason || undefined,
      }));

      pendingCount = withdrawals.filter(w => w.status === 'pending').length;
    } catch (e) {
      // New columns don't exist yet in payout_orders, return empty
      console.log('Payout orders not migrated yet, returning empty withdrawals');
      withdrawals = [];
      pendingCount = 0;
    }

    return NextResponse.json({
      currentRate,
      pendingCount,
      withdrawals,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load admin dashboard' },
      { status: 500 }
    );
  }
}
