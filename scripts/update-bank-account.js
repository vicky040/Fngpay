const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function updateBankAccount() {
  try {
    console.log('🔧 Updating bank account with full details...\n');

    // Update the Kotak Mahindra Bank account ending in 9123
    // Replace XXXXXXXXX with the actual full account number
    const FULL_ACCOUNT_NUMBER = "00005678"; // Replace with actual full number

    const result = await pool.query(
      `UPDATE linked_banks
       SET account_number = $1
       WHERE account_number_last4 = '9123'
       AND bank_name = 'Kotak Mahindra Bank'
       RETURNING id, bank_name, account_holder, account_number`,
      [FULL_ACCOUNT_NUMBER]
    );

    if (result.rowCount === 0) {
      console.log('❌ No matching bank account found');
    } else {
      console.log('✅ Bank account updated successfully!');
      console.log('   Bank:', result.rows[0].bank_name);
      console.log('   Holder:', result.rows[0].account_holder);
      console.log('   Account:', result.rows[0].account_number);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

updateBankAccount();
