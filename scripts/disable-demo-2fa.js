const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function disableDemoTwoFactor() {
  try {
    console.log('🔓 Disabling 2FA for demo accounts...\n');

    const result = await pool.query(
      `UPDATE agents
       SET two_factor_enabled = false
       WHERE agent_code IN ('PV-DEMO1', 'PV-DEMO2', 'PV-DEMO3')
       RETURNING agent_code, full_name, email, two_factor_enabled`
    );

    console.log('✅ 2FA disabled for demo accounts:\n');
    result.rows.forEach(agent => {
      console.log(`   ${agent.agent_code} (${agent.full_name})`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   2FA: ${agent.two_factor_enabled ? 'ENABLED' : 'DISABLED'}`);
      console.log('');
    });

    console.log('✅ Demo accounts can now login without authenticator code!');
    console.log('\n🔑 Login Credentials:');
    console.log('   rahul.sharma2k19@gmail.com / Demo@123');
    console.log('   priya.patel.official@gmail.com / Demo@123');
    console.log('   amitkumar.trader@gmail.com / Demo@123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

disableDemoTwoFactor();
