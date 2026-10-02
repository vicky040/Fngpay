import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const userId = parseInt(id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get user details
    const userResult = await client.query(
      `SELECT a.id, a.agent_code, a.full_name, a.security_deposit_completed, w.balance_usdt
       FROM agents a
       LEFT JOIN wallets w ON w.agent_id = a.id
       WHERE a.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if already approved
    if (user.security_deposit_completed) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Security deposit already approved' },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance (>= 2000 USDT)
    const balance = parseFloat(user.balance_usdt || '0');
    if (balance < 2000) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: `Insufficient balance. User has ${balance} USDT, needs 2000 USDT.` },
        { status: 400 }
      );
    }

    // Approve security deposit
    await client.query(
      'UPDATE agents SET security_deposit_completed = true WHERE id = $1',
      [userId]
    );

    await client.query('COMMIT');

    console.log(`Admin ${auth.admin.agentCode} approved security deposit for user ${user.agent_code}`);

    return NextResponse.json({
      success: true,
      message: `Security deposit approved for ${user.agent_code}`,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Approve security deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to approve security deposit' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
