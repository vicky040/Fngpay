import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function GET() {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    // Get all users with completed security deposit
    const result = await pool.query(`
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
        w.balance_usdt,
        w.total_payin_usdt,
        w.total_payout_usdt,
        w.total_earning_usdt
      FROM agents a
      LEFT JOIN wallets w ON w.agent_id = a.id
      WHERE a.agent_code NOT IN ('PV-ADMIN', 'PV-ADMIN1')
      ORDER BY a.created_at DESC
    `);

    const users = result.rows.map(row => ({
      id: row.id,
      agentCode: row.agent_code,
      fullName: row.full_name,
      email: row.email,
      createdAt: row.created_at,
      securityDepositCompleted: row.security_deposit_completed,
      securityDepositAmount: parseFloat(row.security_deposit_amount || '2000'),
      payinCommissionRate: parseFloat(row.payin_commission_rate || '6'),
      payoutCommissionRate: parseFloat(row.payout_commission_rate || '2'),
      balanceUsdt: parseFloat(row.balance_usdt || '0'),
      totalPayinUsdt: parseFloat(row.total_payin_usdt || '0'),
      totalPayoutUsdt: parseFloat(row.total_payout_usdt || '0'),
      totalEarningUsdt: parseFloat(row.total_earning_usdt || '0'),
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
