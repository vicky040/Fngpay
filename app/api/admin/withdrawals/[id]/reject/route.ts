import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const withdrawalId = Number(id);

    if (!Number.isFinite(withdrawalId)) {
      return NextResponse.json({ error: 'Invalid withdrawal ID' }, { status: 400 });
    }

    const body = await request.json();
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Get withdrawal request
    const checkResult = await pool.query(
      `SELECT id, status FROM payout_orders WHERE id = $1`,
      [withdrawalId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    const withdrawal = checkResult.rows[0];

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot reject withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    // Reject withdrawal
    await pool.query(
      `UPDATE payout_orders
       SET status = 'rejected',
           rejected_at = now(),
           rejection_reason = $1,
           updated_at = now()
       WHERE id = $2`,
      [reason, withdrawalId]
    );

    console.log(`Admin ${auth.agent.agentCode} rejected withdrawal ${withdrawalId}: ${reason}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to reject withdrawal' },
      { status: 500 }
    );
  }
}
