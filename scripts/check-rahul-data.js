const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function checkRahulData() {
  try {
    console.log('🔍 Checking Rahul account data...\n');

    const agentResult = await pool.query(
      "SELECT id, agent_code, full_name FROM agents WHERE agent_code = 'PV-DEMO1'"
    );

    if (agentResult.rows.length === 0) {
      console.log('❌ PV-DEMO1 not found');
      return;
    }

    const agentId = agentResult.rows[0].id;
    console.log('👤 Agent: Rahul Sharma (PV-DEMO1)\n');

    // Get balance
    const balanceResult = await pool.query(
      'SELECT balance_usdt FROM wallets WHERE agent_id = $1',
      [agentId]
    );
    console.log('💰 Current Balance:', balanceResult.rows[0]?.balance_usdt || 0, 'USDT\n');

    // Get transaction summary
    const summaryResult = await pool.query(
      `SELECT
        kind,
        COUNT(*) as count,
        SUM(CAST(REGEXP_REPLACE(amount, '[^0-9.-]', '', 'g') AS NUMERIC)) as total
       FROM wallet_entries
       WHERE agent_id = $1
       GROUP BY kind
       ORDER BY kind`,
      [agentId]
    );

    console.log('📊 Transaction Summary:');
    summaryResult.rows.forEach(row => {
      console.log(`   ${row.kind}:`);
      console.log(`     - Count: ${row.count} transactions`);
      console.log(`     - Total: ${parseFloat(row.total).toFixed(2)} USDT`);
    });

    // Get recent 5 transactions
    const recentResult = await pool.query(
      `SELECT kind, entry_type, amount, occurred_at
       FROM wallet_entries
       WHERE agent_id = $1
       ORDER BY occurred_at DESC
       LIMIT 5`,
      [agentId]
    );

    console.log('\n📝 Recent 5 Transactions:');
    recentResult.rows.forEach((tx, idx) => {
      console.log(`   ${idx + 1}. ${tx.kind} - ${tx.amount} (${tx.occurred_at.toISOString().split('T')[0]})`);
    });

    console.log('\n✅ To see ALL transactions, login and go to History page!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkRahulData();
