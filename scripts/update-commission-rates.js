const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function updateCommissionRates() {
  try {
    console.log('🔧 Updating commission rates...\n');

    // Update Payin rate from 5.5% to 6%
    await pool.query(
      `UPDATE commission_rates
       SET value = '6%'
       WHERE label = 'Payin'`
    );
    console.log('✅ Payin rate updated: 5.5% → 6%');

    // Update Payout rate from 1.5% to 2%
    await pool.query(
      `UPDATE commission_rates
       SET value = '2%'
       WHERE label = 'Payout'`
    );
    console.log('✅ Payout rate updated: 1.5% → 2%');

    // Verify updates
    const result = await pool.query(
      `SELECT label, value, note
       FROM commission_rates
       ORDER BY sort_order`
    );

    console.log('\n📊 Current commission rates:');
    result.rows.forEach(row => {
      console.log(`   ${row.label}: ${row.value} - ${row.note}`);
    });

    console.log('\n✅ Commission rates updated successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateCommissionRates();
