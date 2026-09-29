const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

// Helper to generate random date within last N days
function randomDateInLastDays(days) {
  const now = new Date();
  const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const randomTime = daysAgo.getTime() + Math.random() * (now.getTime() - daysAgo.getTime());
  return new Date(randomTime);
}

async function updateDemoAccounts() {
  const client = await pool.connect();

  try {
    console.log('🔧 Updating demo accounts with transaction data...\n');

    // PRIYA (PV-DEMO2)
    console.log('📝 Updating Priya (PV-DEMO2)...');
    const priyaResult = await client.query(
      "SELECT id FROM agents WHERE agent_code = 'PV-DEMO2'"
    );

    if (priyaResult.rows.length === 0) {
      console.log('❌ PV-DEMO2 not found');
    } else {
      const priyaId = priyaResult.rows[0].id;

      await client.query('BEGIN');

      // Clear existing wallet entries
      await client.query('DELETE FROM wallet_entries WHERE agent_id = $1', [priyaId]);

      let balance = 0;
      const transactions = [];

      // 1. Security Deposit - 30 days ago
      const securityDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      balance = 2000;
      transactions.push({
        agent_id: priyaId,
        kind: 'DEPOSIT',
        entry_type: 'Security Deposit',
        sub: 'Initial security deposit for partnership · TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        occurred_at: securityDate,
        amount: `+2,000.00 USDT`,
        balance: `Bal 2,000.00 USDT`
      });

      // 2. Generate deposits totaling 28456 USDT (around 12-15 transactions)
      const depositCount = 14;
      const avgDeposit = 28456 / depositCount;
      for (let i = 0; i < depositCount; i++) {
        const amount = Math.floor(avgDeposit * (0.8 + Math.random() * 0.4)); // Vary amounts
        balance += amount;
        transactions.push({
          agent_id: priyaId,
          kind: 'DEPOSIT',
          entry_type: 'Customer Deposit',
          sub: `User deposit · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          occurred_at: randomDateInLastDays(28),
          amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // 3. Generate earnings (commission) totaling 1449 USDT (8-10 transactions)
      const earningsCount = 9;
      const avgEarning = 1449 / earningsCount;
      for (let i = 0; i < earningsCount; i++) {
        const amount = Math.floor(avgEarning * (0.7 + Math.random() * 0.6));
        balance += amount;
        transactions.push({
          agent_id: priyaId,
          kind: 'ADJUSTMENT',
          entry_type: 'Commission',
          sub: `Referral commission earned · 1% on trades`,
          occurred_at: randomDateInLastDays(28),
          amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // 4. Generate payouts totaling 22560 USDT (10-12 transactions)
      const payoutCount = 11;
      const avgPayout = 22560 / payoutCount;
      for (let i = 0; i < payoutCount; i++) {
        const amount = Math.floor(avgPayout * (0.8 + Math.random() * 0.4));
        balance -= amount;
        transactions.push({
          agent_id: priyaId,
          kind: 'WITHDRAWAL',
          entry_type: 'Payout',
          sub: `Admin Payout · Bank Transfer · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          occurred_at: randomDateInLastDays(28),
          amount: `-${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // Sort by date
      transactions.sort((a, b) => a.occurred_at - b.occurred_at);

      // Recalculate balances sequentially
      balance = 0;
      transactions.forEach(tx => {
        const amountMatch = tx.amount.match(/([+-]?)([\d,]+\.\d+)/);
        if (amountMatch) {
          const sign = amountMatch[1] === '-' ? -1 : 1;
          const amount = parseFloat(amountMatch[2].replace(/,/g, ''));
          balance += sign * amount;
          tx.balance = `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
        }
      });

      // Insert transactions
      for (const tx of transactions) {
        await client.query(
          `INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tx.agent_id, tx.kind, tx.entry_type, tx.sub, tx.occurred_at, tx.amount, tx.balance]
        );
      }

      // Update wallet balance
      await client.query(
        'UPDATE wallets SET balance_usdt = $1 WHERE agent_id = $2',
        [balance, priyaId]
      );

      await client.query('COMMIT');
      console.log(`   ✅ Priya updated: ${transactions.length} transactions, final balance: ${balance.toFixed(2)} USDT`);
    }

    // RAHUL (PV-DEMO1)
    console.log('\n📝 Updating Rahul (PV-DEMO1)...');
    const rahulResult = await client.query(
      "SELECT id FROM agents WHERE agent_code = 'PV-DEMO1'"
    );

    if (rahulResult.rows.length === 0) {
      console.log('❌ PV-DEMO1 not found');
    } else {
      const rahulId = rahulResult.rows[0].id;

      await client.query('BEGIN');

      // Clear existing wallet entries
      await client.query('DELETE FROM wallet_entries WHERE agent_id = $1', [rahulId]);

      let balance = 0;
      const transactions = [];

      // 1. Security Deposit - 30 days ago
      const securityDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      balance = 2000;
      transactions.push({
        agent_id: rahulId,
        kind: 'DEPOSIT',
        entry_type: 'Security Deposit',
        sub: 'Initial security deposit for partnership · TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        occurred_at: securityDate,
        amount: `+2,000.00 USDT`,
        balance: `Bal 2,000.00 USDT`
      });

      // 2. Generate deposits totaling 31860 USDT (14-16 transactions)
      const depositCount = 15;
      const avgDeposit = 31860 / depositCount;
      for (let i = 0; i < depositCount; i++) {
        const amount = Math.floor(avgDeposit * (0.8 + Math.random() * 0.4));
        balance += amount;
        transactions.push({
          agent_id: rahulId,
          kind: 'DEPOSIT',
          entry_type: 'Customer Deposit',
          sub: `User deposit · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          occurred_at: randomDateInLastDays(28),
          amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // 3. Generate earnings (commission) totaling 1562 USDT (9-11 transactions)
      const earningsCount = 10;
      const avgEarning = 1562 / earningsCount;
      for (let i = 0; i < earningsCount; i++) {
        const amount = Math.floor(avgEarning * (0.7 + Math.random() * 0.6));
        balance += amount;
        transactions.push({
          agent_id: rahulId,
          kind: 'ADJUSTMENT',
          entry_type: 'Commission',
          sub: `Referral commission earned · 1% on trades`,
          occurred_at: randomDateInLastDays(28),
          amount: `+${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // 4. Generate payouts totaling 12456 USDT (8-10 transactions)
      const payoutCount = 9;
      const avgPayout = 12456 / payoutCount;
      for (let i = 0; i < payoutCount; i++) {
        const amount = Math.floor(avgPayout * (0.8 + Math.random() * 0.4));
        balance -= amount;
        transactions.push({
          agent_id: rahulId,
          kind: 'WITHDRAWAL',
          entry_type: 'Payout',
          sub: `Admin Payout · Bank Transfer · TXN${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          occurred_at: randomDateInLastDays(28),
          amount: `-${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`,
          balance: `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`
        });
      }

      // Sort by date
      transactions.sort((a, b) => a.occurred_at - b.occurred_at);

      // Recalculate balances sequentially
      balance = 0;
      transactions.forEach(tx => {
        const amountMatch = tx.amount.match(/([+-]?)([\d,]+\.\d+)/);
        if (amountMatch) {
          const sign = amountMatch[1] === '-' ? -1 : 1;
          const amount = parseFloat(amountMatch[2].replace(/,/g, ''));
          balance += sign * amount;
          tx.balance = `Bal ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
        }
      });

      // Insert transactions
      for (const tx of transactions) {
        await client.query(
          `INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [tx.agent_id, tx.kind, tx.entry_type, tx.sub, tx.occurred_at, tx.amount, tx.balance]
        );
      }

      // Update wallet balance
      await client.query(
        'UPDATE wallets SET balance_usdt = $1 WHERE agent_id = $2',
        [balance, rahulId]
      );

      await client.query('COMMIT');
      console.log(`   ✅ Rahul updated: ${transactions.length} transactions, final balance: ${balance.toFixed(2)} USDT`);
    }

    console.log('\n✅ Demo accounts updated successfully!\n');
    console.log('Summary:');
    console.log('  Priya: Security deposit + deposits + earnings - payouts');
    console.log('  Rahul: Security deposit + deposits + earnings - payouts');
    console.log('\nBoth accounts now show completed security deposits and full transaction history!');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateDemoAccounts();
