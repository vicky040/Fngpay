import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  console.log('Payout API - Agent ID:', agentId);

  // Get wallet balance
  const walletResult = await pool.query<{ balance_usdt: string }>(
    "SELECT balance_usdt FROM wallets WHERE agent_id = $1",
    [agentId]
  );
  console.log('Wallet query result:', walletResult.rows);
  const balanceUsdt = Number(walletResult.rows[0]?.balance_usdt || 0);

  // Get exchange rate from system settings
  let exchangeRate = 104;
  try {
    const rateResult = await pool.query<{ value: string }>(
      "SELECT value FROM system_settings WHERE key = 'exchange_rate_inr_usdt'"
    );
    exchangeRate = Number(rateResult.rows[0]?.value || 104);
  } catch (e) {
    console.log('system_settings table not found, using default rate 104');
  }

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

  console.log('Banks query result:', banksResult.rows.length, 'banks found');

  const banks = banksResult.rows.map((b) => ({
    id: b.id,
    bankName: b.bank_name,
    accountLast4: b.account_number_last4,
  }));

  const response = {
    balanceUsdt: balanceUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    approxInr: approxInr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 }),
    exchangeRate: exchangeRate.toString(),
    banks,
  };

  console.log('Payout API response:', { ...response, banksCount: banks.length });

  return NextResponse.json(response);
}
