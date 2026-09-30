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
    const withdrawalId = parseInt(id);
    const { splits } = await request.json(); // Array of amounts: [200, 200, 300, ...]

    if (!Array.isArray(splits) || splits.length === 0) {
      return NextResponse.json(
        { error: 'Splits must be a non-empty array of amounts' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Get original withdrawal
    const originalResult = await client.query(
      `SELECT * FROM payout_orders WHERE id = $1`,
      [withdrawalId]
    );

    if (originalResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Withdrawal not found' },
        { status: 404 }
      );
    }

    const original = originalResult.rows[0];

    // Check if already split
    if (original.is_split) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'This withdrawal has already been split' },
        { status: 400 }
      );
    }

    // Validate total matches original amount
    const totalSplits = splits.reduce((sum, amt) => sum + parseFloat(amt), 0);
    const originalAmount = parseFloat(original.amount_usdt);

    if (Math.abs(totalSplits - originalAmount) > 0.01) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: `Split total (${totalSplits}) must equal original amount (${originalAmount})` },
        { status: 400 }
      );
    }

    // Mark original as split (change status to 'split')
    await client.query(
      `UPDATE payout_orders SET status = 'split', updated_at = NOW() WHERE id = $1`,
      [withdrawalId]
    );

    // Create split parts
    const splitIds = [];
    for (let i = 0; i < splits.length; i++) {
      const splitAmount = parseFloat(splits[i]);
      const splitAmountInr = splitAmount * parseFloat(original.exchange_rate);

      const result = await client.query(
        `INSERT INTO payout_orders (
          agent_id,
          linked_bank_id,
          amount_usdt,
          amount_inr,
          exchange_rate,
          status,
          parent_withdrawal_id,
          split_part_number,
          split_total_parts,
          is_split,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, 'approved', $6, $7, $8, true, NOW(), NOW())
        RETURNING id`,
        [
          original.agent_id,
          original.linked_bank_id,
          splitAmount,
          splitAmountInr,
          original.exchange_rate,
          withdrawalId,
          i + 1,
          splits.length
        ]
      );

      splitIds.push(result.rows[0].id);
    }

    await client.query('COMMIT');

    console.log(`Admin ${auth.admin.agentCode} split withdrawal ${withdrawalId} into ${splits.length} parts`);

    return NextResponse.json({
      success: true,
      originalId: withdrawalId,
      splitIds,
      message: `Withdrawal split into ${splits.length} parts`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Split withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to split withdrawal' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
