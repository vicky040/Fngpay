const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function addUserSettingsColumns() {
  try {
    console.log('🔧 Adding user settings columns to agents table...\n');

    // Add security_deposit_amount column (default 2000 USDT)
    await pool.query(`
      ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS security_deposit_amount NUMERIC(10, 2) DEFAULT 2000
    `);
    console.log('✅ Added security_deposit_amount column');

    // Add payin_commission_rate column (default 6%)
    await pool.query(`
      ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS payin_commission_rate NUMERIC(5, 2) DEFAULT 6
    `);
    console.log('✅ Added payin_commission_rate column');

    // Add payout_commission_rate column (default 2%)
    await pool.query(`
      ALTER TABLE agents
      ADD COLUMN IF NOT EXISTS payout_commission_rate NUMERIC(5, 2) DEFAULT 2
    `);
    console.log('✅ Added payout_commission_rate column');

    console.log('\n✅ Migration complete!\n');
    console.log('New columns added:');
    console.log('  - security_deposit_amount (default: 2000 USDT)');
    console.log('  - payin_commission_rate (default: 6%)');
    console.log('  - payout_commission_rate (default: 2%)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addUserSettingsColumns();
