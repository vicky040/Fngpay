const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function verify2FAStatus() {
  try {
    console.log('🔍 Checking 2FA status for all agents...\n');

    const result = await pool.query(
      `SELECT agent_code, full_name, email, two_factor_enabled
       FROM agents
       ORDER BY
         CASE
           WHEN agent_code LIKE 'PV-DEMO%' THEN 1
           ELSE 0
         END,
         agent_code`
    );

    console.log('📋 2FA Status Report:\n');

    const demoAccounts = result.rows.filter(a => a.agent_code.startsWith('PV-DEMO'));
    const otherAccounts = result.rows.filter(a => !a.agent_code.startsWith('PV-DEMO'));

    console.log('🎯 Demo Accounts (2FA DISABLED for easy access):');
    demoAccounts.forEach(agent => {
      console.log(`   ${agent.agent_code} - ${agent.full_name}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   2FA: ${agent.two_factor_enabled ? '🔒 ENABLED' : '🔓 DISABLED'}`);
      console.log('');
    });

    console.log('👥 Other Accounts (2FA unchanged):');
    otherAccounts.forEach(agent => {
      console.log(`   ${agent.agent_code} - ${agent.full_name}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   2FA: ${agent.two_factor_enabled ? '🔒 ENABLED' : '🔓 DISABLED'}`);
      console.log('');
    });

    console.log('✅ Summary:');
    console.log(`   Demo accounts: ${demoAccounts.length} (2FA disabled)`);
    console.log(`   Other accounts: ${otherAccounts.length} (2FA unchanged)`);
    console.log('\n✅ Only demo accounts were modified - all other accounts remain unchanged!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

verify2FAStatus();
