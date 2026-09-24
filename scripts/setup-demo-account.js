#!/usr/bin/env node

/**
 * Setup PV-ADMIN as a realistic demo account with:
 * - 20,000 USDT balance
 * - Daily transactions of 2.3+ lakh INR
 * - Bank accounts
 * - Transaction history for last few weeks
 */

const { Pool } = require('pg');

const AGENT_CODE = 'PV-ADMIN';

async function setupDemoAccount() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🚀 Setting up demo account: ${AGENT_CODE}\n`);

    // Check if agent exists
    const agentCheck = await pool.query('SELECT id FROM agents WHERE agent_code = $1', [AGENT_CODE]);

    let agentId;
    if (agentCheck.rows.length === 0) {
      // Create agent account
      console.log(`📝 Creating agent account...`);
      const agentResult = await pool.query(
        `INSERT INTO agents (agent_code, full_name, email, mobile, telegram_id, password_hash, pin_hash, security_deposit_completed, two_factor_enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE, TRUE)
         RETURNING id`,
        [
          AGENT_CODE,
          'Demo Partner',
          'demo@fngpay.app',
          '9876543210',
          '@fngpay_demo',
          '$2b$10$If50dmOR6.EONukOPrIVf.81PosY1SnUw90JUa2FuZB/ciFNs/rBe', // Password: Payvora@123
          '$2b$10$If50dmOR6.EONukOPrIVf.81PosY1SnUw90JUa2FuZB/ciFNs/rBe'  // PIN: 1234
        ]
      );
      agentId = agentResult.rows[0].id;

      // Create wallet
      await pool.query(
        `INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr) VALUES ($1, 0, 110)`,
        [agentId]
      );

      // Create notification preferences
      await pool.query(
        `INSERT INTO notification_preferences (agent_id, email_notifications, telegram_notifications)
         VALUES ($1, TRUE, TRUE)`,
        [agentId]
      );

      // Create referral stats
      await pool.query(
        `INSERT INTO referral_stats (agent_id, referral_code, successful_referrals, agentship_requirement, agentship_unlocked)
         VALUES ($1, $2, 12, 3, TRUE)`,
        [agentId, 'PV-DEMOADMIN']
      );

      console.log(`✅ Agent created with ID: ${agentId}\n`);
    } else {
      agentId = agentCheck.rows[0].id;
      console.log(`✅ Agent exists with ID: ${agentId}\n`);
    }

    // Update wallet balance to 20,000 USDT
    console.log(`💰 Setting balance to 20,000 USDT...`);
    await pool.query(
      `UPDATE wallets
       SET balance_usdt = 20000.00,
           today_payin_inr = 278500.00,
           today_payout_inr = 156200.00,
           today_earning_inr = 8925.00
       WHERE agent_id = $1`,
      [agentId]
    );

    // Add bank accounts
    console.log(`🏦 Adding bank accounts...`);

    // Clear existing banks
    await pool.query('DELETE FROM linked_banks WHERE agent_id = $1', [agentId]);

    const banks = [
      { name: 'HDFC Bank', short: 'HDFC', holder: 'DEMO PARTNER', last4: '4521', ifsc: 'HDFC0001234' },
      { name: 'ICICI Bank', short: 'ICICI', holder: 'DEMO PARTNER', last4: '7890', ifsc: 'ICIC0002345' },
      { name: 'Axis Bank', short: 'Axis', holder: 'DEMO PARTNER', last4: '3456', ifsc: 'UTIB0003456' },
      { name: 'State Bank of India', short: 'SBI', holder: 'DEMO PARTNER', last4: '6789', ifsc: 'SBIN0004567' }
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

        // Random amount between 15,000 to 45,000 INR
        const amountINR = 15000 + Math.floor(Math.random() * 30000);
        const amountUSDT = (amountINR / 110).toFixed(2);
        dailyTotal += amountINR;

        // Calculate running balance
        const balanceUSDT = (20000 - (daysAgo * 50) + (i * 5)).toFixed(2);

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
        const additionalAmount = minDailyINR - dailyTotal + Math.floor(Math.random() * 50000);
        const amountUSDT = (additionalAmount / 110).toFixed(2);
        const txDate = new Date(date);
        txDate.setHours(18, 30, 0, 0);

        entries.push({
          kind: 'DEPOSIT',
          type: 'Deposits',
          sub: `Bulk Payin · HDFC · ${Math.floor(Math.random() * 1000000)}`,
          occurredAt: txDate,
          amount: `+${amountUSDT} USDT`,
          balance: `Bal ${(20000 + 100).toFixed(2)} USDT`
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

      const deposits = 250000 + Math.floor(Math.random() * 100000);
      const withdrawals = 150000 + Math.floor(Math.random() * 80000);
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
      { week: '2026-W38', deposits: 1850000, withdrawals: 980000, sortOrder: 1 },
      { week: '2026-W37', deposits: 1620000, withdrawals: 850000, sortOrder: 2 }
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
       VALUES ($1, 'Monthly', '2026-09', '₹78,50,000', '₹42,30,000', '₹4,94,750', '₹36,20,000', 1)`,
      [agentId]
    );

    // Commission metrics
    const metrics = [
      { label: 'Payin Volume', value: '₹32,50,000', order: 1 },
      { label: 'Payout Volume', value: '₹18,90,000', order: 2 },
      { label: 'Payin Commission (5.5%)', value: '₹1,78,750', order: 3 },
      { label: 'Payout Commission (1.5%)', value: '₹28,350', order: 4 },
      { label: 'Agent Commission (1% EXTRA)', value: '₹51,400', order: 5 },
      { label: 'Total Commission', value: '₹2,58,500', order: 6 }
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
      { day: 'Mon', payin: 85, payout: 42, agent: 18, order: 1 },
      { day: 'Tue', payin: 92, payout: 48, agent: 22, order: 2 },
      { day: 'Wed', payin: 78, payout: 38, agent: 15, order: 3 },
      { day: 'Thu', payin: 95, payout: 52, agent: 25, order: 4 },
      { day: 'Fri', payin: 88, payout: 45, agent: 20, order: 5 }
    ];

    for (const activity of weeklyActivity) {
      await pool.query(
        `INSERT INTO commission_weekly (agent_id, day, payin_pct, payout_pct, agent_pct, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [agentId, activity.day, activity.payin, activity.payout, activity.agent, activity.order]
      );
    }

    console.log(`✅ Commission reports generated\n`);

    // Summary
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✨ Demo Account Setup Complete!\n`);
    console.log(`📋 Account Details:`);
    console.log(`   Agent Code: ${AGENT_CODE}`);
    console.log(`   Balance: 20,000 USDT`);
    console.log(`   Bank Accounts: 4`);
    console.log(`   Transactions: ${entries.length} (21 days)`);
    console.log(`   Daily Volume: ₹2.3+ Lakh`);
    console.log(`\n🔐 Login Credentials:`);
    console.log(`   Agent Code: ${AGENT_CODE}`);
    console.log(`   Email: demo@fngpay.app`);
    console.log(`   Password: Payvora@123`);
    console.log(`   PIN: 1234`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDemoAccount();
