import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const bankName = String(body.bankName ?? "").trim();
  const bankShort = String(body.bankShort ?? "").trim();
  const accountHolder = String(body.accountHolder ?? "").trim();
  const accountNumber = String(body.accountNumber ?? "").trim();
  const confirmAccountNumber = String(body.confirmAccountNumber ?? "").trim();
  const ifscCode = String(body.ifscCode ?? "").trim();

  if (!bankName || !bankShort || !accountHolder || !accountNumber || !ifscCode) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (accountNumber !== confirmAccountNumber) {
    return NextResponse.json({ error: "Account number and confirmation don't match." }, { status: 400 });
  }

  // Only the last 4 digits are kept — a real deployment would tokenize the
  // full account number through a payment processor rather than store it.
  const last4 = accountNumber.slice(-4);

  await pool.query(
    `INSERT INTO linked_banks (agent_id, bank_name, bank_short, account_holder, account_number_last4, ifsc_code)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [auth.agent.id, bankName, bankShort, accountHolder, last4, ifscCode]
  );

  return NextResponse.json({ ok: true });
}
