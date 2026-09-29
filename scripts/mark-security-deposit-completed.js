const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function markSecurityDepositCompleted() {
  try {
    console.log('🔧 Marking security deposit as completed for demo accounts...\n');

    // Update PV-DEMO1 (Rahul)
    const rahulResult = await pool.query(
      `UPDATE agents
       SET security_deposit_completed = true
       WHERE agent_code = 'PV-DEMO1'
       RETURNING agent_code, full_name, security_deposit_completed`
    );

    if (rahulResult.rowCount > 0) {
      console.log('✅ PV-DEMO1 (Rahul Sharma)');
      console.log('   Status:', rahulResult.rows[0].security_deposit_completed ? 'Completed' : 'Not completed');
    }

    // Update PV-DEMO2 (Priya)
    const priyaResult = await pool.query(
      `UPDATE agents
       SET security_deposit_completed = true
       WHERE agent_code = 'PV-DEMO2'
       RETURNING agent_code, full_name, security_deposit_completed`
    );

    if (priyaResult.rowCount > 0) {
      console.log('✅ PV-DEMO2 (Priya Patel)');
      console.log('   Status:', priyaResult.rows[0].security_deposit_completed ? 'Completed' : 'Not completed');
    }

    console.log('\n✅ Security deposit marked as completed!');
    console.log('\nNow refresh the page - should show "2,000 USDT ✅ Completed"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

markSecurityDepositCompleted();
