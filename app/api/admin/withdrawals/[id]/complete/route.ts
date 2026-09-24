import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  const client = await pool.connect();

  try {
    const { id } = await params;
    const withdrawalId = Number(id);

    if (!Number.isFinite(withdrawalId)) {
      return NextResponse.json({ error: 'Invalid withdrawal ID' }, { status: 400 });
    }

    await client.query('BEGIN');

    // Get withdrawal request with bank details
    const checkResult = await client.query<{
      id: number;
      status: string;
      agent_id: number;
      amount_usdt: string;
      amount_inr: string;
      bank_name: string;
      account_number_last4: string;
    }>(
      `SELECT
        po.id,
        po.status,
        po.agent_id,
        po.amount_usdt,
        po.amount_inr,
        lb.bank_name,
        lb.account_number_last4
      FROM payout_orders po
      JOIN linked_banks lb ON lb.id = po.linked_bank_id
      WHERE po.id = $1`,
      [withdrawalId]
    );

    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Withdrawal request not found' }, { status: 404 });
    }

    const withdrawal = checkResult.rows[0];

    if (withdrawal.status !== 'approved') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: `Cannot complete withdrawal with status: ${withdrawal.status}. Must be approved first.` },
        { status: 400 }
      );
    }

    const amountUsdt = Number(withdrawal.amount_usdt);
    const amountInr = Number(withdrawal.amount_inr);

    // Check user balance
    const balanceResult = await client.query<{ balance_usdt: string }>(
      `SELECT balance_usdt FROM wallets WHERE agent_id = $1`,
      [withdrawal.agent_id]
    );

    if (balanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'User wallet not found' }, { status: 404 });
    }

    const currentBalance = Number(balanceResult.rows[0].balance_usdt);

    if (currentBalance < amountUsdt) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: `Insufficient balance. User has ${currentBalance} USDT but withdrawal is ${amountUsdt} USDT` },
        { status: 400 }
      );
    }

    // Deduct balance
    const newBalance = currentBalance - amountUsdt;

    await client.query(
      `UPDATE wallets
       SET balance_usdt = balance_usdt - $1,
           today_payout_inr = today_payout_inr + $2
       WHERE agent_id = $3`,
      [amountUsdt, amountInr, withdrawal.agent_id]
    );

    // Generate transaction ID
    const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create wallet entry for transaction history
    await client.query(
      `INSERT INTO wallet_entries (
        agent_id, kind, entry_type, sub,
        occurred_at, amount, balance
      ) VALUES ($1, $2, $3, $4, now(), $5, $6)`,
      [
        withdrawal.agent_id,
        'WITHDRAWAL',
        'Withdrawals',
        `Admin Payout · ${withdrawal.bank_name} ****${withdrawal.account_number_last4} · ${txnId}`,
        `-${amountUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
        `Bal ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
      ]
    );

    // Mark withdrawal as completed
    await client.query(
      `UPDATE payout_orders
       SET status = 'completed',
           completed_at = now(),
           updated_at = now()
       WHERE id = $1`,
      [withdrawalId]
    );

    await client.query('COMMIT');

    console.log(`Admin ${auth.agent.agentCode} completed withdrawal ${withdrawalId} - Deducted ${amountUsdt} USDT from user`);

    return NextResponse.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Complete withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to complete withdrawal' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
