const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

// Realistic email addresses
const EMAIL_UPDATES = [
  {
    agentCode: 'PV-DEMO1',
    newEmail: 'rahul.sharma2k19@gmail.com',
    name: 'Rahul Sharma'
  },
  {
    agentCode: 'PV-DEMO2',
    newEmail: 'priya.patel.official@gmail.com',
    name: 'Priya Patel'
  },
  {
    agentCode: 'PV-DEMO3',
    newEmail: 'amitkumar.trader@gmail.com',
    name: 'Amit Kumar'
  }
];

async function updateEmails() {
  try {
    console.log('📧 Updating demo account emails to look realistic...\n');

    for (const update of EMAIL_UPDATES) {
      const result = await pool.query(
        `UPDATE agents
         SET email = $1
         WHERE agent_code = $2
         RETURNING id, agent_code, full_name, email`,
        [update.newEmail, update.agentCode]
      );

      if (result.rows.length > 0) {
        const agent = result.rows[0];
        console.log(`✅ ${agent.agent_code} (${agent.full_name})`);
        console.log(`   Old: demo${update.agentCode.slice(-1)}@fngpay.com`);
        console.log(`   New: ${agent.email}`);
        console.log(`   Password: Demo@123 (unchanged)\n`);
      } else {
        console.log(`⚠️  ${update.agentCode} not found\n`);
      }
    }

    console.log('✅ All demo emails updated!\n');
    console.log('🔑 Login Credentials:');
    console.log('   PV-DEMO1: rahul.sharma2k19@gmail.com / Demo@123');
    console.log('   PV-DEMO2: priya.patel.official@gmail.com / Demo@123');
    console.log('   PV-DEMO3: amitkumar.trader@gmail.com / Demo@123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateEmails();
