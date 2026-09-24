import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  try {
    // Get wallet balance
    const walletResult = await pool.query<{ balance_usdt: string }>(
      "SELECT balance_usdt FROM wallets WHERE agent_id = $1",
      [agentId]
    );

    const balanceUsdt = Number(walletResult.rows[0]?.balance_usdt || 0);

    // Get exchange rate from system settings
    const rateResult = await pool.query<{ value: string }>(
      "SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'"
    );

    const exchangeRate = Number(rateResult.rows[0]?.value || 104);
    const approxInr = balanceUsdt * exchangeRate;

    // Get linked banks
    const banksResult = await pool.query<{
      id: number;
      bank_name: string;
      account_number_last4: string;
    }>(
      `SELECT id, bank_name, account_number_last4
       FROM linked_banks
       WHERE agent_id = $1
       ORDER BY created_at DESC`,
      [agentId]
    );

    const banks = banksResult.rows.map((b) => ({
      id: b.id,
      bankName: b.bank_name,
      accountLast4: b.account_number_last4,
    }));

    // Get withdrawal requests
    const withdrawalsResult = await pool.query<{
      id: number;
      amount_usdt: string;
      amount_inr: string;
      bank_name: string;
      account_number_last4: string;
      status: string;
      created_at: Date;
      rejection_reason: string | null;
    }>(
      `SELECT
        po.id,
        po.amount_usdt,
        po.amount_inr,
        lb.bank_name,
        lb.account_number_last4,
        po.status,
        po.created_at,
        po.rejection_reason
      FROM payout_orders po
      JOIN linked_banks lb ON lb.id = po.linked_bank_id
      WHERE po.agent_id = $1
      ORDER BY po.created_at DESC`,
      [agentId]
    );

    const withdrawals = withdrawalsResult.rows.map((w) => ({
      id: w.id,
      amountUsdt: Number(w.amount_usdt).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountInr: Number(w.amount_inr).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
      bankName: w.bank_name,
      accountLast4: w.account_number_last4,
      status: w.status,
      createdAt: formatEntryDateTime(new Date(w.created_at)),
      rejectionReason: w.rejection_reason || undefined,
    }));

    return NextResponse.json({
      balanceUsdt: balanceUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      approxInr: approxInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
      exchangeRate: exchangeRate.toString(),
      banks,
      withdrawals,
    });
  } catch (error) {
    console.error('Payout API error:', error);
    return NextResponse.json(
      { error: 'Failed to load payout data' },
      { status: 500 }
    );
  }
}
