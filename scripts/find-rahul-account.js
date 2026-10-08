/**
 * Find Rahul's account in the database
 * Run: node scripts/find-rahul-account.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function findRahul() {
  const client = await pool.connect();

  try {
    console.log('🔍 Searching for accounts...\n');

    // Find all agents
    const agentResult = await client.query(`
      SELECT id, agent_code, full_name, email
      FROM agents
      ORDER BY created_at DESC
      LIMIT 10
    `);

    console.log(`Found ${agentResult.rows.length} accounts:\n`);

    agentResult.rows.forEach((agent, index) => {
      console.log(`${index + 1}. ${agent.full_name}`);
      console.log(`   Agent Code: ${agent.agent_code}`);
      console.log(`   Email: ${agent.email}`);
      console.log(`   ID: ${agent.id}\n`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

findRahul().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
