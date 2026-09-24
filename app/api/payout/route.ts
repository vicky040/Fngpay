import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  try {
    // Get wallet balance
    let balanceUsdt = 0;
    try {
      const walletResult = await pool.query<{ balance_usdt: string }>(
        "SELECT balance_usdt FROM wallets WHERE agent_id = $1",
        [agentId]
      );
      balanceUsdt = Number(walletResult.rows[0]?.balance_usdt || 0);
    } catch (e) {
      console.error('Error fetching wallet balance:', e);
    }

    // Get exchange rate from system settings (fallback to 104 if table doesn't exist)
    let exchangeRate = 104;
    try {
      const rateResult = await pool.query<{ value: string }>(
        "SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'"
      );
      exchangeRate = Number(rateResult.rows[0]?.value || 104);
    } catch (e) {
      // system_settings table doesn't exist yet, use default
      console.log('system_settings table not found, using default rate 104');
    }

    const approxInr = balanceUsdt * exchangeRate;

    // Get linked banks
    let banks: Array<{
      id: number;
      bankName: string;
      accountLast4: string;
    }> = [];

    try {
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

      banks = banksResult.rows.map((b) => ({
        id: b.id,
        bankName: b.bank_name,
        accountLast4: b.account_number_last4,
      }));
    } catch (e) {
      console.error('Error fetching linked banks:', e);
      banks = [];
    }

    return NextResponse.json({
      balanceUsdt: balanceUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      approxInr: approxInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
      exchangeRate: exchangeRate.toString(),
      banks,
    });
  } catch (error) {
    console.error('Payout API error:', error);

    // Return safe defaults instead of error
    return NextResponse.json({
      balanceUsdt: '0.00',
      approxInr: '0',
      exchangeRate: '104',
      banks: [],
    });
  }
}
