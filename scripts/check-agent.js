const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function checkAgent() {
  try {
    // Check PV-ADMIN agent
    const result = await pool.query(
      `SELECT id, agent_code, full_name, email, mobile, created_at
       FROM agents
       WHERE agent_code = 'PV-ADMIN'`
    );

    if (result.rows.length === 0) {
      console.log('❌ PV-ADMIN agent not found in database');
    } else {
      const agent = result.rows[0];
      console.log('✅ PV-ADMIN agent details:');
      console.log('   ID:', agent.id);
      console.log('   Agent Code:', agent.agent_code);
      console.log('   Full Name:', agent.full_name);
      console.log('   Email:', agent.email);
      console.log('   Mobile:', agent.mobile);
      console.log('   Created:', agent.created_at);
      console.log('\n⚠️  Password was NOT changed - existing password still works');
      console.log('   Login with existing credentials: ' + agent.email);
    }

    // Also show all admin agents
    console.log('\n📋 All agents with admin codes:');
    const allAdmins = await pool.query(
      `SELECT agent_code, full_name, email
       FROM agents
       WHERE agent_code LIKE 'PV-ADMIN%'
       ORDER BY agent_code`
    );

    allAdmins.rows.forEach(a => {
      console.log(`   ${a.agent_code}: ${a.full_name} (${a.email})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkAgent();
