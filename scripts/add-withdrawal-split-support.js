const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function addWithdrawalSplitSupport() {
  try {
    console.log('🔧 Adding withdrawal split support to payout_orders table...\n');

    // Add parent_withdrawal_id (for split parts)
    await pool.query(`
      ALTER TABLE payout_orders
      ADD COLUMN IF NOT EXISTS parent_withdrawal_id INTEGER REFERENCES payout_orders(id)
    `);
    console.log('✅ Added parent_withdrawal_id column');

    // Add split_part_number
    await pool.query(`
      ALTER TABLE payout_orders
      ADD COLUMN IF NOT EXISTS split_part_number INTEGER DEFAULT 0
    `);
    console.log('✅ Added split_part_number column');

    // Add split_total_parts
    await pool.query(`
      ALTER TABLE payout_orders
      ADD COLUMN IF NOT EXISTS split_total_parts INTEGER DEFAULT 0
    `);
    console.log('✅ Added split_total_parts column');

    // Add is_split flag
    await pool.query(`
      ALTER TABLE payout_orders
      ADD COLUMN IF NOT EXISTS is_split BOOLEAN DEFAULT false
    `);
    console.log('✅ Added is_split column');

    console.log('\n✅ Migration complete!\n');
    console.log('Withdrawal split support added:');
    console.log('  - parent_withdrawal_id (links split parts to original)');
    console.log('  - split_part_number (which part: 1, 2, 3...)');
    console.log('  - split_total_parts (total splits)');
    console.log('  - is_split (true if this is a split part)\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addWithdrawalSplitSupport();
