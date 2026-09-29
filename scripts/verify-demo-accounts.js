const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function verifyAccounts() {
  try {
    console.log('🔍 Verifying demo accounts data...\n');

    // Check Priya
    const priyaAgent = await pool.query(
      "SELECT id, agent_code, full_name, email FROM agents WHERE agent_code = 'PV-DEMO2'"
    );

    if (priyaAgent.rows.length > 0) {
      const priyaId = priyaAgent.rows[0].id;
      console.log('📊 PRIYA (PV-DEMO2)');
      console.log('   Email:', priyaAgent.rows[0].email);
      console.log('   Name:', priyaAgent.rows[0].full_name);

      // Check balance
      const priyaBalance = await pool.query(
        'SELECT balance_usdt FROM wallets WHERE agent_id = $1',
        [priyaId]
      );
      console.log('   Balance:', priyaBalance.rows[0]?.balance_usdt || 0, 'USDT');

      // Count transactions
      const priyaTransactions = await pool.query(
        'SELECT kind, COUNT(*) as count FROM wallet_entries WHERE agent_id = $1 GROUP BY kind ORDER BY kind',
        [priyaId]
      );
      console.log('   Transactions:');
      priyaTransactions.rows.forEach(row => {
        console.log(`     - ${row.kind}: ${row.count} transactions`);
      });

      // Check for security deposit
      const priyaSecurity = await pool.query(
        "SELECT * FROM wallet_entries WHERE agent_id = $1 AND entry_type = 'Security Deposit' LIMIT 1",
        [priyaId]
      );
      console.log('   Security Deposit:', priyaSecurity.rows.length > 0 ? '✅ Found' : '❌ Not found');
    }

    console.log('\n');

    // Check Rahul
    const rahulAgent = await pool.query(
      "SELECT id, agent_code, full_name, email FROM agents WHERE agent_code = 'PV-DEMO1'"
    );

    if (rahulAgent.rows.length > 0) {
      const rahulId = rahulAgent.rows[0].id;
      console.log('📊 RAHUL (PV-DEMO1)');
      console.log('   Email:', rahulAgent.rows[0].email);
      console.log('   Name:', rahulAgent.rows[0].full_name);

      // Check balance
      const rahulBalance = await pool.query(
        'SELECT balance_usdt FROM wallets WHERE agent_id = $1',
        [rahulId]
      );
      console.log('   Balance:', rahulBalance.rows[0]?.balance_usdt || 0, 'USDT');

      // Count transactions
      const rahulTransactions = await pool.query(
        'SELECT kind, COUNT(*) as count FROM wallet_entries WHERE agent_id = $1 GROUP BY kind ORDER BY kind',
        [rahulId]
      );
      console.log('   Transactions:');
      rahulTransactions.rows.forEach(row => {
        console.log(`     - ${row.kind}: ${row.count} transactions`);
      });

      // Check for security deposit
      const rahulSecurity = await pool.query(
        "SELECT * FROM wallet_entries WHERE agent_id = $1 AND entry_type = 'Security Deposit' LIMIT 1",
        [rahulId]
      );
      console.log('   Security Deposit:', rahulSecurity.rows.length > 0 ? '✅ Found' : '❌ Not found');
    }

    console.log('\n✅ Verification complete!');
    console.log('\nIf data looks correct here but not showing on website:');
    console.log('1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('2. Hard refresh page (Ctrl+Shift+R)');
    console.log('3. Logout and login again');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

verifyAccounts();
