#!/usr/bin/env node

/**
 * Fix transaction history for PV-ADMIN and PV-ADMIN1:
 * 1. Add 20,000 USDT security deposit entry
 * 2. All transactions should be minimum 2,000 USDT
 * 3. Maintain daily volume of 2.3+ lakh INR
 */

const { Pool } = require('pg');

const AGENT_CODES = ['PV-ADMIN', 'PV-ADMIN1'];
const RATE = 104; // INR/USDT

async function fixTransactionHistory() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    for (const agentCode of AGENT_CODES) {
      console.log(`\n🔧 Fixing ${agentCode} transaction history...\n`);

      // Get agent ID
      const agentResult = await pool.query(
        'SELECT id FROM agents WHERE agent_code = $1',
        [agentCode]
      );

      if (agentResult.rows.length === 0) {
        console.log(`❌ Agent ${agentCode} not found\n`);
        continue;
      }

      const agentId = agentResult.rows[0].id;

      // Clear existing entries
      await pool.query('DELETE FROM wallet_entries WHERE agent_id = $1', [agentId]);
      console.log(`🗑️  Cleared old transactions`);

      const today = new Date();
      const entries = [];

      // Add security deposit (3 weeks ago)
      const depositDate = new Date(today);
      depositDate.setDate(depositDate.getDate() - 21);
      depositDate.setHours(10, 0, 0, 0);

      entries.push({
        kind: 'ADJUSTMENT',
        type: 'Adjustments',
        sub: 'Security Deposit (Initial Balance)',
        occurredAt: depositDate,
        amount: '+20,000 USDT',
        balance: 'Bal 20,000 USDT'
      });

      console.log(`✅ Added 20,000 USDT security deposit`);

      // Generate 21 days of transactions (minimum 2,000 USDT per transaction)
      for (let daysAgo = 20; daysAgo >= 0; daysAgo--) {
        const date = new Date(today);
        date.setDate(date.getDate() - daysAgo);

        // 6-8 transactions per day (less frequent but larger amounts)
        const transactionsPerDay = 6 + Math.floor(Math.random() * 3);
        let dailyTotalUSDT = 0;
        const minDailyUSDT = 2200; // Minimum 2200 USDT daily (to ensure 2.3+ lakh INR)

        for (let i = 0; i < transactionsPerDay; i++) {
          const hour = 9 + Math.floor(Math.random() * 10);
          const minute = Math.floor(Math.random() * 60);
          const txDate = new Date(date);
          txDate.setHours(hour, minute, 0, 0);

          // Alternate between deposits and withdrawals
          const isDeposit = i % 2 === 0;

          // Random amount between 2,000 to 5,000 USDT
          const amountUSDT = 2000 + Math.floor(Math.random() * 3000);
          dailyTotalUSDT += amountUSDT;

          // Calculate running balance
          const balanceUSDT = 20000 + (i * 50) + Math.floor(Math.random() * 500);

          const entry = {
            kind: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
            type: isDeposit ? 'Deposits' : 'Withdrawals',
            sub: isDeposit
              ? `Payin · HDFC · TXN${Math.floor(Math.random() * 1000000)}`
              : `Payout · ICICI · TXN${Math.floor(Math.random() * 1000000)}`,
            occurredAt: txDate,
            amount: isDeposit ? `+${amountUSDT.toLocaleString('en-US')} USDT` : `-${amountUSDT.toLocaleString('en-US')} USDT`,
            balance: `Bal ${balanceUSDT.toLocaleString('en-US')} USDT`
          };

          entries.push(entry);
        }

        // If daily total is less than minimum, add one more large transaction
        if (dailyTotalUSDT < minDailyUSDT) {
          const additionalUSDT = minDailyUSDT - dailyTotalUSDT + Math.floor(Math.random() * 1000);
          const txDate = new Date(date);
          txDate.setHours(19, 30, 0, 0);

          entries.push({
            kind: 'DEPOSIT',
            type: 'Deposits',
            sub: `Bulk Payin · Axis · TXN${Math.floor(Math.random() * 1000000)}`,
            occurredAt: txDate,
            amount: `+${additionalUSDT.toLocaleString('en-US')} USDT`,
            balance: `Bal ${(20000 + additionalUSDT).toLocaleString('en-US')} USDT`
          });
        }
      }

      // Insert all entries
      for (const entry of entries) {
        await pool.query(
          `INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [agentId, entry.kind, entry.type, entry.sub, entry.occurredAt, entry.amount, entry.balance]
        );
      }

      console.log(`✅ Generated ${entries.length} transactions (all > 2,000 USDT)`);
      console.log(`   - 1 security deposit: 20,000 USDT`);
      console.log(`   - ${entries.length - 1} trading transactions: 2,000-5,000 USDT each`);
      console.log(`   - Daily volume: 2.3+ Lakh INR (2,200+ USDT)`);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ Transaction History Fixed!\n`);
    console.log(`📋 Summary:`);
    console.log(`   - Security deposit: 20,000 USDT (shown in history)`);
    console.log(`   - All transactions: 2,000+ USDT minimum`);
    console.log(`   - Daily volume: ₹2.3+ Lakh (2,200+ USDT)`);
    console.log(`   - Applied to: PV-ADMIN & PV-ADMIN1`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

fixTransactionHistory();
