import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

export async function GET() {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    const result = await pool.query<{ value: string }>(
      `SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'`
    );

    const currentRate = result.rows[0]?.value || "104";

    return NextResponse.json({ rate: currentRate });
  } catch (error) {
    console.error('Get exchange rate error:', error);
    return NextResponse.json(
      { error: 'Failed to get exchange rate' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    const body = await request.json();
    const newRate = Number(body.newRate);

    // Validation
    if (!Number.isFinite(newRate) || newRate <= 0 || newRate > 1000) {
      return NextResponse.json(
        { error: 'Exchange rate must be between 0 and 1000' },
        { status: 400 }
      );
    }

    // Update exchange rate
    await pool.query(
      `UPDATE system_settings
       SET value = $1, updated_at = now(), updated_by = $2
       WHERE key = 'exchange_rate_inr_usdt'`,
      [newRate.toString(), auth.agent.id]
    );

    console.log(`Admin ${auth.agent.agentCode} updated exchange rate to ${newRate} INR/USDT`);

    return NextResponse.json({
      success: true,
      rate: newRate.toString(),
    });
  } catch (error) {
    console.error('Update exchange rate error:', error);
    return NextResponse.json(
      { error: 'Failed to update exchange rate' },
      { status: 500 }
    );
  }
}
