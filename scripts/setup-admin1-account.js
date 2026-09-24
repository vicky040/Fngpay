#!/usr/bin/env node

/**
 * Setup PV-ADMIN1 as a realistic demo account with:
 * - 20,000 USDT balance
 * - Daily transactions of 2.3+ lakh INR
 * - Bank accounts
 * - Transaction history for last few weeks
 * - Exchange rate: 104 INR/USDT
 */

const { Pool } = require('pg');

const AGENT_CODE = 'PV-ADMIN1';

async function setupAdmin1Account() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🚀 Setting up demo account: ${AGENT_CODE}\n`);

    // Get agent ID
    const agentCheck = await pool.query('SELECT id FROM agents WHERE agent_code = $1', [AGENT_CODE]);

    if (agentCheck.rows.length === 0) {
      console.log(`❌ Agent ${AGENT_CODE} not found. Please ensure it exists first.`);
      return;
    }

    const agentId = agentCheck.rows[0].id;
    console.log(`✅ Agent found with ID: ${agentId}\n`);

    // Update wallet balance to 20,000 USDT with 104 INR/USDT rate
    console.log(`💰 Setting balance to 20,000 USDT at 104 INR/USDT rate...`);
    await pool.query(
      `UPDATE wallets
       SET balance_usdt = 20000.00,
           fixed_rate_inr = 104.00,
           today_payin_inr = 285400.00,
           today_payout_inr = 162800.00,
           today_earning_inr = 9150.00
       WHERE agent_id = $1`,
      [agentId]
    );

    // Add bank accounts
    console.log(`🏦 Adding bank accounts...`);

    // Clear existing banks
    await pool.query('DELETE FROM linked_banks WHERE agent_id = $1', [agentId]);

    const banks = [
      { name: 'HDFC Bank', short: 'HDFC', holder: 'VICKY NEHRA', last4: '8521', ifsc: 'HDFC0001567' },
      { name: 'ICICI Bank', short: 'ICICI', holder: 'VICKY NEHRA', last4: '2890', ifsc: 'ICIC0002789' },
      { name: 'Axis Bank', short: 'Axis', holder: 'VICKY NEHRA', last4: '5456', ifsc: 'UTIB0003890' },
      { name: 'Kotak Mahindra Bank', short: 'Kotak', holder: 'VICKY NEHRA', last4: '9123', ifsc: 'KKBK0005678' }
    ];

    for (const bank of banks) {
      await pool.query(
        `INSERT INTO linked_banks (agent_id, bank_name, bank_short, account_holder, account_number_last4, ifsc_code)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [agentId, bank.name, bank.short, bank.holder, bank.last4, bank.ifsc]
      );
    }
    console.log(`✅ Added ${banks.length} bank accounts\n`);

    // Generate transaction history for last 3 weeks
    console.log(`📊 Generating transaction history...`);

    // Clear existing entries
    await pool.query('DELETE FROM wallet_entries WHERE agent_id = $1', [agentId]);

    const today = new Date();
    const entries = [];

    // Generate 21 days of transactions (3 weeks)
    for (let daysAgo = 20; daysAgo >= 0; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      // Generate multiple transactions per day (8-12 transactions)
      const transactionsPerDay = 8 + Math.floor(Math.random() * 5);
      let dailyTotal = 0;
      const minDailyINR = 230000; // 2.3 lakh minimum

      for (let i = 0; i < transactionsPerDay; i++) {
        const hour = 9 + Math.floor(Math.random() * 11); // Between 9 AM - 8 PM
        const minute = Math.floor(Math.random() * 60);
        const txDate = new Date(date);
        txDate.setHours(hour, minute, 0, 0);

        // Alternate between deposits and withdrawals
        const isDeposit = i % 2 === 0;

        // Random amount between 18,000 to 48,000 INR
        const amountINR = 18000 + Math.floor(Math.random() * 30000);
        const amountUSDT = (amountINR / 104).toFixed(2); // Using 104 rate
        dailyTotal += amountINR;

        // Calculate running balance
        const balanceUSDT = (20000 - (daysAgo * 45) + (i * 4.8)).toFixed(2);

        const entry = {
          kind: isDeposit ? 'DEPOSIT' : 'WITHDRAWAL',
          type: isDeposit ? 'Deposits' : 'Withdrawals',
          sub: isDeposit
            ? `Payin · ${banks[i % banks.length].short} · ${Math.floor(Math.random() * 1000000)}`
            : `Payout · ${banks[i % banks.length].short} · ${Math.floor(Math.random() * 1000000)}`,
          occurredAt: txDate,
          amount: isDeposit ? `+${amountUSDT} USDT` : `-${amountUSDT} USDT`,
          balance: `Bal ${balanceUSDT} USDT`
        };

        entries.push(entry);
      }

      // If daily total is less than 2.3 lakh, add one more large transaction
      if (dailyTotal < minDailyINR) {
        const additionalAmount = minDailyINR - dailyTotal + Math.floor(Math.random() * 60000);
        const amountUSDT = (additionalAmount / 104).toFixed(2);
        const txDate = new Date(date);
        txDate.setHours(19, 0, 0, 0);

        entries.push({
          kind: 'DEPOSIT',
          type: 'Deposits',
          sub: `Bulk Payin · HDFC · ${Math.floor(Math.random() * 1000000)}`,
          occurredAt: txDate,
          amount: `+${amountUSDT} USDT`,
          balance: `Bal ${(20000 + 120).toFixed(2)} USDT`
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

    console.log(`✅ Generated ${entries.length} transactions over 21 days\n`);

    // Generate commission reports
    console.log(`📈 Generating commission reports...`);

    await pool.query('DELETE FROM commission_reports WHERE agent_id = $1', [agentId]);
    await pool.query('DELETE FROM commission_metrics WHERE agent_id = $1', [agentId]);
    await pool.query('DELETE FROM commission_weekly WHERE agent_id = $1', [agentId]);

    // Daily reports (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const deposits = 260000 + Math.floor(Math.random() * 110000);
      const withdrawals = 155000 + Math.floor(Math.random() * 85000);
      const commission = Math.floor(deposits * 0.055 + withdrawals * 0.015);
      const net = deposits - withdrawals;

      await pool.query(
        `INSERT INTO commission_reports (agent_id, period_type, period_label, deposits, withdrawals, commission, net, sort_order)
         VALUES ($1, 'Daily', $2, $3, $4, $5, $6, $7)`,
        [agentId, dateStr, `₹${deposits.toLocaleString('en-IN')}`, `₹${withdrawals.toLocaleString('en-IN')}`,
         `₹${commission.toLocaleString('en-IN')}`, `₹${net.toLocaleString('en-IN')}`, 7 - i]
      );
    }

    // Weekly reports
    const weeklyData = [
      { week: '2026-W38', deposits: 1920000, withdrawals: 1020000, sortOrder: 1 },
      { week: '2026-W37', deposits: 1680000, withdrawals: 890000, sortOrder: 2 }
    ];

    for (const week of weeklyData) {
      const commission = Math.floor(week.deposits * 0.055 + week.withdrawals * 0.015);
      const net = week.deposits - week.withdrawals;

      await pool.query(
        `INSERT INTO commission_reports (agent_id, period_type, period_label, deposits, withdrawals, commission, net, sort_order)
         VALUES ($1, 'Weekly', $2, $3, $4, $5, $6, $7)`,
        [agentId, week.week, `₹${week.deposits.toLocaleString('en-IN')}`,
         `₹${week.withdrawals.toLocaleString('en-IN')}`,
         `₹${commission.toLocaleString('en-IN')}`,
         `₹${net.toLocaleString('en-IN')}`, week.sortOrder]
      );
    }

    // Monthly reports
    await pool.query(
      `INSERT INTO commission_reports (agent_id, period_type, period_label, deposits, withdrawals, commission, net, sort_order)
       VALUES ($1, 'Monthly', '2026-09', '₹82,40,000', '₹44,60,000', '₹5,20,700', '₹37,80,000', 1)`,
      [agentId]
    );

    // Commission metrics
    const metrics = [
      { label: 'Payin Volume', value: '₹34,20,000', order: 1 },
      { label: 'Payout Volume', value: '₹19,80,000', order: 2 },
      { label: 'Payin Commission (5.5%)', value: '₹1,88,100', order: 3 },
      { label: 'Payout Commission (1.5%)', value: '₹29,700', order: 4 },
      { label: 'Agent Commission (1% EXTRA)', value: '₹54,000', order: 5 },
      { label: 'Total Commission', value: '₹2,71,800', order: 6 }
    ];

    for (const metric of metrics) {
      await pool.query(
        `INSERT INTO commission_metrics (agent_id, label, value, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [agentId, metric.label, metric.value, metric.order]
      );
    }

    // Weekly activity
    const weeklyActivity = [
      { day: 'Mon', payin: 88, payout: 45, agent: 20, order: 1 },
      { day: 'Tue', payin: 95, payout: 50, agent: 24, order: 2 },
      { day: 'Wed', payin: 82, payout: 40, agent: 17, order: 3 },
      { day: 'Thu', payin: 98, payout: 55, agent: 27, order: 4 },
      { day: 'Fri', payin: 90, payout: 48, agent: 22, order: 5 }
    ];

    for (const activity of weeklyActivity) {
      await pool.query(
        `INSERT INTO commission_weekly (agent_id, day, payin_pct, payout_pct, agent_pct, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [agentId, activity.day, activity.payin, activity.payout, activity.agent, activity.order]
      );
    }

    console.log(`✅ Commission reports generated\n`);

    // Update referral stats
    await pool.query(
      `UPDATE referral_stats
       SET successful_referrals = 15, agentship_unlocked = TRUE
       WHERE agent_id = $1`,
      [agentId]
    );

    // Summary
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ Demo Account Setup Complete!\n`);
    console.log(`📋 Account Details:`);
    console.log(`   Agent Code: ${AGENT_CODE}`);
    console.log(`   Balance: 20,000 USDT`);
    console.log(`   Exchange Rate: 104 INR/USDT`);
    console.log(`   INR Value: ₹20,80,000`);
    console.log(`   Bank Accounts: 4`);
    console.log(`   Transactions: ${entries.length} (21 days)`);
    console.log(`   Daily Volume: ₹2.3+ Lakh`);
    console.log(`   Referrals: 15 (Agentship Unlocked)`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupAdmin1Account();
