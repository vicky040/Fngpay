import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function GET() {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    // Get all users
    const result = await pool.query(`
      SELECT
        a.id,
        a.agent_code,
        a.full_name,
        a.email,
        a.created_at,
        a.security_deposit_completed,
        COALESCE(a.security_deposit_amount, 2000) as security_deposit_amount,
        COALESCE(a.payin_commission_rate, 6) as payin_commission_rate,
        COALESCE(a.payout_commission_rate, 2) as payout_commission_rate,
        COALESCE(w.balance_usdt, 0) as balance_usdt
      FROM agents a
      LEFT JOIN wallets w ON w.agent_id = a.id
      WHERE a.agent_code NOT IN ('PV-ADMIN', 'PV-ADMIN1')
      ORDER BY a.created_at DESC
    `);

    // Calculate totals from wallet_entries for each user
    const usersWithTotals = await Promise.all(
      result.rows.map(async (row) => {
        // Get transaction totals from wallet_entries
        const totalsResult = await pool.query(`
          SELECT
            kind,
            SUM(CAST(REGEXP_REPLACE(amount, '[^0-9.-]', '', 'g') AS NUMERIC)) as total
          FROM wallet_entries
          WHERE agent_id = $1
          GROUP BY kind
        `, [row.id]);

        const totals = {
          payin: 0,
          payout: 0,
          earning: 0,
        };

        totalsResult.rows.forEach(t => {
          const amount = Math.abs(parseFloat(t.total || '0'));
          if (t.kind === 'DEPOSIT') totals.payin = amount;
          else if (t.kind === 'WITHDRAWAL') totals.payout = amount;
          else if (t.kind === 'ADJUSTMENT') totals.earning = amount;
        });

        return {
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
          totalPayinUsdt: totals.payin,
          totalPayoutUsdt: totals.payout,
          totalEarningUsdt: totals.earning,
        };
      })
    );

    return NextResponse.json({ users: usersWithTotals });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to get users' },
      { status: 500 }
    );
  }
}
