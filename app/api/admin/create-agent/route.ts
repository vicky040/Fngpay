import { NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/api-admin-auth";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateAgentCode() {
  const client = await pool.connect();
  try {
    for (let attempt = 0; attempt < 20; attempt++) {
      let suffix = "";
      for (let i = 0; i < 6; i++) {
        suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
      }
      const code = `PV-${suffix}`;

      const { rows } = await client.query(
        "SELECT 1 FROM agents WHERE agent_code = $1",
        [code]
      );

      if (rows.length === 0) return code;
    }
    throw new Error("Could not generate a unique agent code after 20 attempts");
  } finally {
    client.release();
  }
}

type Transaction = {
  type: "payin" | "payout" | "commission";
  amount: string;
  date: string;
  description?: string;
};

export async function POST(request: Request) {
  const auth = await requireApiAdmin();
  if ("error" in auth) return auth.error;

  try {
    const body = await request.json();
    const {
      fullName,
      email,
      mobile,
      telegramId,
      password,
      securityDepositAmount,
      transactions = [],
    } = body;

    // Validate required fields
    if (!fullName || !email || !mobile || !password) {
      return NextResponse.json(
        { error: "Full name, email, mobile, and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate mobile format (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return NextResponse.json(
        { error: "Mobile number must be exactly 10 digits" },
        { status: 400 }
      );
    }

    // Validate amounts
    const securityDeposit = parseFloat(securityDepositAmount) || 0;
    if (securityDeposit < 0) {
      return NextResponse.json(
        { error: "Security deposit cannot be negative" },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Check if email already exists
      const emailCheck = await client.query(
        "SELECT id FROM agents WHERE email = $1",
        [email]
      );
      if (emailCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }

      // Generate agent code
      const agentCode = await generateAgentCode();

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create agent
      const agentResult = await client.query(
        `INSERT INTO agents (
          agent_code, full_name, email, mobile, telegram_id,
          password_hash, security_deposit_completed, security_deposit_amount,
          two_factor_enabled, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        RETURNING id`,
        [
          agentCode,
          fullName,
          email,
          mobile,
          telegramId || null,
          passwordHash,
          securityDeposit > 0,
          securityDeposit.toFixed(2),
          false,
        ]
      );

      const agentId = agentResult.rows[0].id;

      // Calculate initial balance from transactions
      let currentBalance = securityDeposit;
      const walletEntries: Array<{
        kind: string;
        type: string;
        sub: string;
        amount: string;
        balance: string;
        date: Date;
      }> = [];

      // Add security deposit entry if > 0
      if (securityDeposit > 0) {
        walletEntries.push({
          kind: "DEPOSIT",
          type: "Admin Adjustment",
          sub: `Security Deposit - Created by ${auth.admin.agentCode}`,
          amount: `+${securityDeposit.toFixed(2)} USDT`,
          balance: `Bal ${currentBalance.toFixed(2)} USDT`,
          date: new Date(),
        });
      }

      // Process transactions in chronological order
      const sortedTransactions = (transactions as Transaction[])
        .filter((tx) => parseFloat(tx.amount) > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      for (const tx of sortedTransactions) {
        const txAmount = parseFloat(tx.amount);

        let kind: string;
        let entryType: string;
        let sign: string;

        if (tx.type === "payout") {
          kind = "WITHDRAWAL";
          entryType = "Withdrawals";
          sign = "-";
          currentBalance -= txAmount;
        } else if (tx.type === "commission") {
          kind = "ADJUSTMENT";
          entryType = "Commission";
          sign = "+";
          currentBalance += txAmount;
        } else {
          // payin
          kind = "DEPOSIT";
          entryType = "Deposits";
          sign = "+";
          currentBalance += txAmount;
        }

        const description = tx.description || `${tx.type} transaction`;

        walletEntries.push({
          kind,
          type: entryType,
          sub: `${description} - Created by ${auth.admin.agentCode}`,
          amount: `${sign}${txAmount.toFixed(2)} USDT`,
          balance: `Bal ${currentBalance.toFixed(2)} USDT`,
          date: new Date(tx.date),
        });
      }

      // Create wallet
      await client.query(
        `INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr, balance_inr, today_payin_inr, today_payout_inr, today_earning_inr)
        VALUES ($1, $2, 104, 0, 0, 0, 0)`,
        [agentId, currentBalance.toFixed(2)]
      );

      // Create wallet entries
      for (const entry of walletEntries) {
        await client.query(
          `INSERT INTO wallet_entries (
            agent_id, kind, entry_type, sub, occurred_at, amount, balance
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [agentId, entry.kind, entry.type, entry.sub, entry.date, entry.amount, entry.balance]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        agentCode,
        agentId,
        initialBalance: currentBalance.toFixed(2),
        transactionsCreated: walletEntries.length,
        message: `Agent ${agentCode} created with ${walletEntries.length} transactions`,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error creating agent:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error in create-agent API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create agent",
      },
      { status: 500 }
    );
  }
}
