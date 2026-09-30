/**
 * Add admin adjustment columns for payin/payout totals
 * Run: node scripts/add-admin-total-adjustments.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log('Adding admin adjustment columns to agents table...');

    await client.query(`
      ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS admin_payin_adjustment NUMERIC(18,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS admin_payout_adjustment NUMERIC(18,2) DEFAULT 0
    `);

    console.log('✅ Successfully added admin adjustment columns!');
    console.log('   - admin_payin_adjustment (for correcting total payin)');
    console.log('   - admin_payout_adjustment (for correcting total payout)');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
