/**
 * Fix Jerry's balance by adding security deposit amount
 * Run: node scripts/fix-jerry-balance.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function fixJerryBalance() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking Jerry\'s account...\n');

    // Find Jerry
    const userResult = await client.query(`
      SELECT
        a.id,
        a.agent_code,
        a.full_name,
        a.security_deposit_completed,
        COALESCE(a.security_deposit_amount, 2000) as security_deposit_amount,
        COALESCE(w.balance_usdt, 0) as balance_usdt
      FROM agents a
      LEFT JOIN wallets w ON w.agent_id = a.id
      WHERE a.agent_code = 'PV-P7HZ43'
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ Jerry not found!');
      return;
    }

    const jerry = userResult.rows[0];
    console.log('📋 Jerry\'s current state:');
    console.log(`   Agent Code: ${jerry.agent_code}`);
    console.log(`   Name: ${jerry.full_name}`);
    console.log(`   Security Deposit Amount: ${jerry.security_deposit_amount} USDT`);
    console.log(`   Current Balance: ${jerry.balance_usdt} USDT`);
    console.log(`   Security Deposit Completed: ${jerry.security_deposit_completed}`);

    if (parseFloat(jerry.balance_usdt) >= parseFloat(jerry.security_deposit_amount)) {
      console.log('\n✅ Balance already correct! Nothing to fix.');
      return;
    }

    console.log('\n🔧 Fixing balance...');

    await client.query('BEGIN');

    const depositAmount = parseFloat(jerry.security_deposit_amount);

    // Check if wallet exists
    const walletCheck = await client.query(
      'SELECT agent_id, balance_usdt FROM wallets WHERE agent_id = $1',
      [jerry.id]
    );

    if (walletCheck.rows.length === 0) {
      // Create wallet
      console.log('   Creating new wallet...');
      await client.query(
        'INSERT INTO wallets (agent_id, balance_usdt, balance_inr) VALUES ($1, $2, 0)',
        [jerry.id, depositAmount]
      );
    } else {
      // Update balance
      console.log('   Updating existing wallet...');
      const currentBalance = parseFloat(walletCheck.rows[0].balance_usdt || '0');
      const newBalance = currentBalance + depositAmount;

      await client.query(
        'UPDATE wallets SET balance_usdt = $1 WHERE agent_id = $2',
        [newBalance, jerry.id]
      );
    }

    // Create wallet entry
    console.log('   Creating wallet entry...');
    await client.query(
      `INSERT INTO wallet_entries (
        agent_id,
        kind,
        entry_type,
        sub,
        occurred_at,
        amount,
        balance
      ) VALUES ($1, $2, $3, $4, NOW(), $5, $6)`,
      [
        jerry.id,
        'ADJUSTMENT',
        'Admin Adjustment',
        'Security Deposit Approved - Manual Fix',
        `+${depositAmount.toFixed(2)} USDT`,
        `Bal ${depositAmount.toFixed(2)} USDT`
      ]
    );

    await client.query('COMMIT');

    console.log('\n✅ SUCCESS!');
    console.log(`   New Balance: ${depositAmount.toFixed(2)} USDT`);
    console.log(`   Transaction entry created`);
    console.log(`   Jerry can now use the panel!\n`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixJerryBalance().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
