import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const amountUsdt = Number(body.amountUsdt);
    const linkedBankId = Number(body.linkedBankId);

    // Validation
    const MIN_WITHDRAWAL = 100; // Minimum 100 USDT

    if (!Number.isFinite(amountUsdt) || amountUsdt < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${MIN_WITHDRAWAL} USDT` },
        { status: 400 }
      );
    }

    if (!Number.isFinite(linkedBankId)) {
      return NextResponse.json(
        { error: 'Invalid bank account selected' },
        { status: 400 }
      );
    }

    // Check user balance
    const balanceResult = await pool.query<{ balance_usdt: string }>(
      `SELECT balance_usdt FROM wallets WHERE agent_id = $1`,
      [auth.agent.id]
    );

    if (balanceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = Number(balanceResult.rows[0].balance_usdt);

    if (amountUsdt > currentBalance) {
      return NextResponse.json(
        { error: `Insufficient balance. You have ${currentBalance.toFixed(2)} USDT` },
        { status: 400 }
      );
    }

    // Verify bank account belongs to user
    const bankResult = await pool.query(
      `SELECT id FROM linked_banks WHERE id = $1 AND agent_id = $2`,
      [linkedBankId, auth.agent.id]
    );

    if (bankResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Bank account not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Get current exchange rate
    const rateResult = await pool.query<{ value: string }>(
      `SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'`
    );

    const exchangeRate = Number(rateResult.rows[0]?.value || 104);
    const amountInr = amountUsdt * exchangeRate;

    // Create withdrawal request
    const insertResult = await pool.query(
      `INSERT INTO payout_orders (
        agent_id,
        linked_bank_id,
        amount_usdt,
        amount_inr,
        exchange_rate,
        status,
        amount,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, 'pending', $6, now())
      RETURNING id`,
      [
        auth.agent.id,
        linkedBankId,
        amountUsdt,
        amountInr,
        exchangeRate,
        `${amountUsdt.toFixed(2)} USDT`, // Legacy amount field
      ]
    );

    const requestId = insertResult.rows[0].id;

    console.log(`User ${auth.agent.agentCode} created withdrawal request ${requestId} for ${amountUsdt} USDT`);

    return NextResponse.json({
      success: true,
      requestId,
      message: 'Withdrawal request submitted successfully. Admin will review shortly.',
    });
  } catch (error) {
    console.error('Create withdrawal request error:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal request' },
      { status: 500 }
    );
  }
}
