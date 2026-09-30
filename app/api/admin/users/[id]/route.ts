import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const userId = parseInt(id);

    // Get user details
    const userResult = await pool.query(`
      SELECT
        a.id,
        a.agent_code,
        a.full_name,
        a.email,
        a.created_at,
        a.security_deposit_completed,
        a.security_deposit_amount,
        a.payin_commission_rate,
        a.payout_commission_rate,
        w.balance_usdt
      FROM agents a
      LEFT JOIN wallets w ON w.agent_id = a.id
      WHERE a.id = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    return NextResponse.json({
      user: {
        id: user.id,
        agentCode: user.agent_code,
        fullName: user.full_name,
        email: user.email,
        createdAt: user.created_at,
        securityDepositCompleted: user.security_deposit_completed,
        securityDepositAmount: parseFloat(user.security_deposit_amount || '2000'),
        payinCommissionRate: parseFloat(user.payin_commission_rate || '6'),
        payoutCommissionRate: parseFloat(user.payout_commission_rate || '2'),
        balanceUsdt: parseFloat(user.balance_usdt || '0'),
      }
    });
  } catch (error) {
    console.error('Get user detail error:', error);
    return NextResponse.json(
      { error: 'Failed to get user details' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();

    const {
      securityDepositAmount,
      payinCommissionRate,
      payoutCommissionRate,
      securityDepositCompleted,
      totalPayinUsdt,
      totalPayoutUsdt
    } = body;

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (securityDepositAmount !== undefined) {
      updates.push(`security_deposit_amount = $${paramIndex}`);
      values.push(securityDepositAmount);
      paramIndex++;
    }

    if (payinCommissionRate !== undefined) {
      updates.push(`payin_commission_rate = $${paramIndex}`);
      values.push(payinCommissionRate);
      paramIndex++;
    }

    if (payoutCommissionRate !== undefined) {
      updates.push(`payout_commission_rate = $${paramIndex}`);
      values.push(payoutCommissionRate);
      paramIndex++;
    }

    if (securityDepositCompleted !== undefined) {
      updates.push(`security_deposit_completed = $${paramIndex}`);
      values.push(securityDepositCompleted);
      paramIndex++;
    }

    // Handle total payin/payout updates by calculating adjustments
    if (totalPayinUsdt !== undefined) {
      // Get current total from wallet_entries
      const totalsResult = await pool.query(`
        SELECT
          SUM(CAST(REGEXP_REPLACE(amount, '[^0-9.-]', '', 'g') AS NUMERIC)) as total
        FROM wallet_entries
        WHERE agent_id = $1 AND kind = 'DEPOSIT'
      `, [userId]);

      const currentTotal = Math.abs(parseFloat(totalsResult.rows[0]?.total || '0'));
      const targetTotal = parseFloat(totalPayinUsdt);
      const adjustment = targetTotal - currentTotal;

      updates.push(`admin_payin_adjustment = $${paramIndex}`);
      values.push(adjustment);
      paramIndex++;
    }

    if (totalPayoutUsdt !== undefined) {
      // Get current total from wallet_entries
      const totalsResult = await pool.query(`
        SELECT
          SUM(CAST(REGEXP_REPLACE(amount, '[^0-9.-]', '', 'g') AS NUMERIC)) as total
        FROM wallet_entries
        WHERE agent_id = $1 AND kind = 'WITHDRAWAL'
      `, [userId]);

      const currentTotal = Math.abs(parseFloat(totalsResult.rows[0]?.total || '0'));
      const targetTotal = parseFloat(totalPayoutUsdt);
      const adjustment = targetTotal - currentTotal;

      updates.push(`admin_payout_adjustment = $${paramIndex}`);
      values.push(adjustment);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add user ID as last parameter
    values.push(userId);

    await pool.query(
      `UPDATE agents SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    console.log(`Admin ${auth.admin.agentCode} updated user ${userId} settings`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
