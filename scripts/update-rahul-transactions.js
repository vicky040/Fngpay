/**
 * Update Rahul's account with transactions through October 8, 2026
 * Run: node scripts/update-rahul-transactions.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function updateRahulTransactions() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking Rahul\'s account...\n');

    // Find Rahul Sharma's account (PV-DEMO1)
    const agentResult = await client.query(`
      SELECT id, agent_code, full_name, email
      FROM agents
      WHERE agent_code = 'PV-DEMO1'
    `);

    if (agentResult.rows.length === 0) {
      console.log('❌ Demo account not found!');
      return;
    }

    const agent = agentResult.rows[0];
    console.log('📋 Account found:');
    console.log(`   Agent Code: ${agent.agent_code}`);
    console.log(`   Name: ${agent.full_name}`);
    console.log(`   Email: ${agent.email}\n`);

    // Get current balance and latest transaction
    const balanceResult = await client.query(`
      SELECT balance_usdt FROM wallets WHERE agent_id = $1
    `, [agent.id]);

    const latestTransactionResult = await client.query(`
      SELECT occurred_at, amount, balance, kind
      FROM wallet_entries
      WHERE agent_id = $1
      ORDER BY occurred_at DESC
      LIMIT 1
    `, [agent.id]);

    const currentBalance = parseFloat(balanceResult.rows[0]?.balance_usdt || '0');
    console.log(`💰 Current Balance: ${currentBalance.toFixed(2)} USDT\n`);

    if (latestTransactionResult.rows.length > 0) {
      const latest = latestTransactionResult.rows[0];
      console.log('📅 Latest Transaction:');
      console.log(`   Date: ${latest.occurred_at}`);
      console.log(`   Type: ${latest.kind}`);
      console.log(`   Amount: ${latest.amount}`);
      console.log(`   Balance: ${latest.balance}\n`);
    }

    console.log('➕ Adding new transactions from Sept 29 - Oct 8...\n');

    await client.query('BEGIN');

    let balance = currentBalance;

    // September 29 - October 8 transactions
    const transactions = [
      // Sept 29-30
      { date: '2026-09-29 09:15:00+00', kind: 'DEPOSIT', amount: 1850, desc: 'Auto USDT TRC20 · 5a92b1c67e34…' },
      { date: '2026-09-29 14:30:00+00', kind: 'WITHDRAWAL', amount: -980, desc: 'Admin Payout · HDFC ****8521 · TXN49012' },
      { date: '2026-09-30 10:45:00+00', kind: 'DEPOSIT', amount: 2100, desc: 'Auto USDT TRC20 · 8c34f6a21d57…' },
      { date: '2026-09-30 16:20:00+00', kind: 'ADJUSTMENT', amount: 72, desc: 'Payin commission · 6% on ₹1,24,800' },

      // October 1-3
      { date: '2026-10-01 11:30:00+00', kind: 'DEPOSIT', amount: 1920, desc: 'Auto USDT TRC20 · 3d78a5b92c41…' },
      { date: '2026-10-01 15:50:00+00', kind: 'WITHDRAWAL', amount: -1150, desc: 'Admin Payout · ICICI ****2890 · TXN49028' },
      { date: '2026-10-02 09:20:00+00', kind: 'ADJUSTMENT', amount: 45, desc: 'Payout commission · 2% on ₹2,34,000' },
      { date: '2026-10-02 13:40:00+00', kind: 'DEPOSIT', amount: 2340, desc: 'Auto USDT TRC20 · 9e45c8d12a63…' },
      { date: '2026-10-03 10:15:00+00', kind: 'WITHDRAWAL', amount: -1280, desc: 'Admin Payout · SBI ****7654 · TXN49043' },

      // October 4-6
      { date: '2026-10-04 11:50:00+00', kind: 'DEPOSIT', amount: 1780, desc: 'Auto USDT TRC20 · 6b23d9f14e58…' },
      { date: '2026-10-04 16:30:00+00', kind: 'ADJUSTMENT', amount: 68, desc: 'Payin commission · 6% on ₹1,18,560' },
      { date: '2026-10-05 09:40:00+00', kind: 'DEPOSIT', amount: 2150, desc: 'Auto USDT TRC20 · 2f89a4c36d71…' },
      { date: '2026-10-05 14:25:00+00', kind: 'WITHDRAWAL', amount: -1420, desc: 'Admin Payout · Kotak ****3421 · TXN49059' },
      { date: '2026-10-06 10:55:00+00', kind: 'DEPOSIT', amount: 1950, desc: 'Auto USDT TRC20 · 7c56e1b92f34…' },

      // October 7-8
      { date: '2026-10-07 12:10:00+00', kind: 'ADJUSTMENT', amount: 58, desc: 'Payout commission · 2% on ₹3,01,600' },
      { date: '2026-10-07 15:45:00+00', kind: 'WITHDRAWAL', amount: -1520, desc: 'Admin Payout · Axis ****5678 · TXN49074' },
      { date: '2026-10-08 09:30:00+00', kind: 'DEPOSIT', amount: 2280, desc: 'Auto USDT TRC20 · 4a78c3e91d62…' },
      { date: '2026-10-08 13:50:00+00', kind: 'WITHDRAWAL', amount: -1100, desc: 'Admin Payout · HDFC ****8521 · TXN49089' },
      { date: '2026-10-08 17:15:00+00', kind: 'ADJUSTMENT', amount: 82, desc: 'Payin commission · 6% on ₹1,42,640' },
    ];

    let inserted = 0;
    for (const txn of transactions) {
      balance += txn.amount;

      const entryType = txn.kind === 'DEPOSIT' ? 'Deposits' :
                       txn.kind === 'WITHDRAWAL' ? 'Withdrawals' :
                       'Commission';

      const amountStr = txn.amount >= 0 ? `+${txn.amount.toFixed(2)} USDT` : `${txn.amount.toFixed(2)} USDT`;
      const balanceStr = `Bal ${balance.toFixed(2)} USDT`;

      await client.query(`
        INSERT INTO wallet_entries (
          agent_id, kind, entry_type, sub, occurred_at, amount, balance
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        agent.id,
        txn.kind,
        entryType,
        txn.desc,
        txn.date,
        amountStr,
        balanceStr
      ]);

      inserted++;
      console.log(`   ✓ ${txn.date.substring(0, 10)} - ${txn.kind} - ${amountStr}`);
    }

    // Update wallet balance
    await client.query(`
      UPDATE wallets
      SET balance_usdt = $1
      WHERE agent_id = $2
    `, [balance, agent.id]);

    await client.query('COMMIT');

    console.log(`\n✅ SUCCESS!`);
    console.log(`   Added ${inserted} transactions`);
    console.log(`   New Balance: ${balance.toFixed(2)} USDT\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   Period: Sept 29 - Oct 8, 2026`);
    console.log(`   Deposits: ${transactions.filter(t => t.kind === 'DEPOSIT').length}`);
    console.log(`   Withdrawals: ${transactions.filter(t => t.kind === 'WITHDRAWAL').length}`);
    console.log(`   Commissions: ${transactions.filter(t => t.kind === 'ADJUSTMENT').length}`);
    console.log(`   Final Balance: ${balance.toFixed(2)} USDT`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateRahulTransactions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
