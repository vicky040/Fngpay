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

    // Get withdrawal request
    const checkResult = await pool.query(
      `SELECT id, status, agent_id FROM payout_orders WHERE id = $1`,
      [withdrawalId]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    const withdrawal = checkResult.rows[0];

    if (withdrawal.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot approve withdrawal with status: ${withdrawal.status}` },
        { status: 400 }
      );
    }

    // Approve withdrawal
    await pool.query(
      `UPDATE payout_orders
       SET status = 'approved',
           approved_at = now(),
           approved_by = $1,
           updated_at = now()
       WHERE id = $2`,
      [auth.agent.id, withdrawalId]
    );

    console.log(`Admin ${auth.agent.agentCode} approved withdrawal ${withdrawalId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to approve withdrawal' },
      { status: 500 }
    );
  }
}
