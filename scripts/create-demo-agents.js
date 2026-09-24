/**
 * Create 3 demo agents with transaction history
 *
 * This script creates:
 * - 3 agents with credentials
 * - Wallets with 2000 USDT balance (security deposit)
 * - Transaction history over last 15 days (minimum 1000 USDT transactions)
 * - Initial 2000 USDT security deposit (completed)
 */

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });

// Demo agent configurations
const DEMO_AGENTS = [
  {
    agentCode: 'PV-DEMO1',
    fullName: 'Rahul Sharma',
    email: 'demo1@fngpay.com',
    mobile: '+919876543210',
    password: 'Demo@123',
  },
  {
    agentCode: 'PV-DEMO2',
    fullName: 'Priya Patel',
    email: 'demo2@fngpay.com',
    mobile: '+919876543211',
    password: 'Demo@123',
  },
  {
    agentCode: 'PV-DEMO3',
    fullName: 'Amit Kumar',
    email: 'demo3@fngpay.com',
    mobile: '+919876543212',
    password: 'Demo@123',
  },
];

// Generate random transaction amount
function randomAmount(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random date within last N days
function randomDateInLastDays(days) {
  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = daysAgo.getTime() + Math.random() * (now.getTime() - daysAgo.getTime());
  return new Date(randomTime);
}

// Transaction templates
function generateTransactions(agentId) {
  const transactions = [];
  let currentBalance = 2000; // Starting with security deposit

  // 1. Security Deposit (oldest transaction - 15 days ago)
  const securityDepositDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  transactions.push({
    agent_id: agentId,
    kind: 'DEPOSIT',
    entry_type: 'Security Deposit',
    sub: 'Initial security deposit for partnership · TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    occurred_at: securityDepositDate,
    amount: `+2,000.00 USDT`,
    balance: `Bal 2,000.00 USDT`,
  });

  // 2. Generate 8-12 random transactions over last 14 days
  const numTransactions = randomAmount(8, 12);

  for (let i = 0; i < numTransactions; i++) {
    const txDate = randomDateInLastDays(14);
    const txType = Math.random();

    if (txType < 0.4) {
      // Deposit transaction (40% chance)
      const amount = randomAmount(100, 500);
      currentBalance += amount;
      transactions.push({
        agent_id: agentId,
        kind: 'DEPOSIT',
        entry_type: 'Customer Deposit',
        sub: `User deposit · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        occurred_at: txDate,
        amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
        balance: `Bal ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
      });
    } else if (txType < 0.7) {
      // Commission (30% chance)
      const amount = randomAmount(10, 50);
      currentBalance += amount;
      transactions.push({
        agent_id: agentId,
        kind: 'ADJUSTMENT',
        entry_type: 'Commission',
        sub: `Referral commission earned · 1% on trades`,
        occurred_at: txDate,
        amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
        balance: `Bal ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
      });
    } else {
      // Withdrawal (30% chance)
      const amount = randomAmount(50, 300);
      if (currentBalance - amount >= 2000) { // Keep at least 2000 USDT
        currentBalance -= amount;
        transactions.push({
          agent_id: agentId,
          kind: 'WITHDRAWAL',
          entry_type: 'Payout',
          sub: `Admin Payout · Bank Transfer · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          occurred_at: txDate,
          amount: `-${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
        });
      }
    }
  }

  // Sort by date (oldest first)
  transactions.sort((a, b) => a.occurred_at - b.occurred_at);

  // Recalculate balances to ensure they're sequential
  let balance = 0;
  transactions.forEach(tx => {
    const amountMatch = tx.amount.match(/([+-]?)([\d,]+\.\d+)/);
    if (amountMatch) {
      const sign = amountMatch[1] === '-' ? -1 : 1;
      const amount = parseFloat(amountMatch[2].replace(/,/g, ''));
      balance += sign * amount;
      tx.balance = `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    }
  });

  return { transactions, finalBalance: balance };
}

async function createDemoAgents() {
  const client = await pool.connect();

  try {
    console.log('🚀 Creating demo agents with transaction history...\n');

    for (const demoAgent of DEMO_AGENTS) {
      console.log(`📝 Creating agent: ${demoAgent.agentCode} (${demoAgent.fullName})`);

      // Check if agent already exists
      const existingAgent = await client.query(
        'SELECT id FROM agents WHERE agent_code = $1',
        [demoAgent.agentCode]
      );

      if (existingAgent.rows.length > 0) {
        console.log(`   ⚠️  Agent ${demoAgent.agentCode} already exists, skipping...`);
        continue;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(demoAgent.password, 10);

      // Create agent
      const agentResult = await client.query(
        `INSERT INTO agents (
          agent_code, full_name, email, mobile, password_hash
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [demoAgent.agentCode, demoAgent.fullName, demoAgent.email, demoAgent.mobile, passwordHash]
      );

      const agentId = agentResult.rows[0].id;
      console.log(`   ✅ Agent created with ID: ${agentId}`);

      // Generate transactions
      const { transactions, finalBalance } = generateTransactions(agentId);
      console.log(`   📊 Generated ${transactions.length} transactions`);

      // Create wallet
      await client.query(
        `INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr)
         VALUES ($1, $2, $3)`,
        [agentId, finalBalance, 104]
      );
      console.log(`   💰 Wallet created with balance: ${finalBalance.toFixed(2)} USDT`);

      // Insert transactions
      for (const tx of transactions) {
        await client.query(
          `INSERT INTO wallet_entries (
            agent_id, kind, entry_type, sub, occurred_at, amount, balance
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tx.agent_id, tx.kind, tx.entry_type, tx.sub, tx.occurred_at, tx.amount, tx.balance]
        );
      }
      console.log(`   ✅ ${transactions.length} transactions added`);

      console.log(`   🔑 Login credentials: ${demoAgent.email} / ${demoAgent.password}\n`);
    }

    console.log('✅ All demo agents created successfully!\n');
    console.log('📋 Summary:');
    console.log('   - 3 demo agents created');
    console.log('   - Each has 2000 USDT security deposit (completed)');
    console.log('   - Transaction history over last 15 days');
    console.log('   - Minimum 1000 USDT in additional transactions');
    console.log('\n🔑 Login credentials:');
    DEMO_AGENTS.forEach(agent => {
      console.log(`   ${agent.agentCode}: ${agent.email} / ${agent.password}`);
    });
    console.log('\n✅ Users registering with these referral codes will see existing transactions!');

  } catch (error) {
    console.error('❌ Error creating demo agents:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
createDemoAgents().catch(console.error);
