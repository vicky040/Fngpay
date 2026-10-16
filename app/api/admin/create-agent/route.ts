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
      initialPayin,
      initialPayout,
      transactionDate,
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
    const payin = parseFloat(initialPayin) || 0;
    const payout = parseFloat(initialPayout) || 0;

    if (securityDeposit < 0 || payin < 0 || payout < 0) {
      return NextResponse.json(
        { error: "Amounts cannot be negative" },
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
          securityDeposit > 0, // Mark as completed if deposit provided
          securityDeposit.toFixed(2),
          false, // Two-factor disabled by default
        ]
      );

      const agentId = agentResult.rows[0].id;

      // Calculate initial balance
      const initialBalance = securityDeposit + payin - payout;

      // Create wallet
      await client.query(
        `INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr, balance_inr, today_payin_inr, today_payout_inr, today_earning_inr)
        VALUES ($1, $2, 104, 0, 0, 0, 0)`,
        [agentId, initialBalance.toFixed(2)]
      );

      // Create wallet entries
      const txDate = transactionDate ? new Date(transactionDate) : new Date();
      const entries = [];

      if (securityDeposit > 0) {
        entries.push({
          kind: "DEPOSIT",
          type: "Admin Adjustment",
          sub: `Security Deposit - Created by ${auth.admin.agentCode}`,
          amount: `+${securityDeposit.toFixed(2)} USDT`,
          balance: `Bal ${securityDeposit.toFixed(2)} USDT`,
        });
      }

      if (payin > 0) {
        const currentBal = securityDeposit + payin;
        entries.push({
          kind: "DEPOSIT",
          type: "Deposits",
          sub: `Initial Payin - Created by ${auth.admin.agentCode}`,
          amount: `+${payin.toFixed(2)} USDT`,
          balance: `Bal ${currentBal.toFixed(2)} USDT`,
        });
      }

      if (payout > 0) {
        entries.push({
          kind: "WITHDRAWAL",
          type: "Withdrawals",
          sub: `Initial Payout - Created by ${auth.admin.agentCode}`,
          amount: `-${payout.toFixed(2)} USDT`,
          balance: `Bal ${initialBalance.toFixed(2)} USDT`,
        });
      }

      for (const entry of entries) {
        await client.query(
          `INSERT INTO wallet_entries (
            agent_id, kind, entry_type, sub, occurred_at, amount, balance
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [agentId, entry.kind, entry.type, entry.sub, txDate, entry.amount, entry.balance]
        );
      }

      await client.query("COMMIT");

      return NextResponse.json({
        success: true,
        agentCode,
        agentId,
        initialBalance: initialBalance.toFixed(2),
        message: `Agent ${agentCode} created successfully`,
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
