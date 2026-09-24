import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;
  const agentId = auth.agent.id;

  console.log('=== PAYOUT API DEBUG ===');
  console.log('Agent ID:', agentId);
  console.log('Agent Code:', auth.agent.agentCode);

  // Get wallet balance
  const walletResult = await pool.query<{ balance_usdt: string }>(
    "SELECT balance_usdt FROM wallets WHERE agent_id = $1",
    [agentId]
  );
  console.log('Wallet query - Row count:', walletResult.rowCount);
  console.log('Wallet query - Rows:', JSON.stringify(walletResult.rows));
  console.log('First row balance_usdt:', walletResult.rows[0]?.balance_usdt);

  const balanceUsdt = Number(walletResult.rows[0]?.balance_usdt || 0);
  console.log('Parsed balanceUsdt:', balanceUsdt);

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
    approxInr: Math.round(approxInr).toLocaleString('en-IN'),
    exchangeRate: exchangeRate.toString(),
    banks,
  };

  console.log('=== PAYOUT API RESPONSE ===');
  console.log('Balance USDT (raw):', balanceUsdt);
  console.log('Balance USDT (formatted):', response.balanceUsdt);
  console.log('Approx INR:', response.approxInr);
  console.log('Exchange rate:', response.exchangeRate);
  console.log('Banks count:', banks.length);
  console.log('Full response:', JSON.stringify(response, null, 2));

  return NextResponse.json(response);
}
