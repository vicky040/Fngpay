/**
 * Update support FAQ to show correct website and Telegram info
 * Run: node scripts/update-support-faq.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

async function updateSupportFAQ() {
  const client = await pool.connect();

  try {
    console.log('🔍 Checking current support FAQ...\n');

    // Get current FAQ
    const currentResult = await client.query(`
      SELECT question, answer FROM faqs WHERE question = 'How can I contact support?'
    `);

    if (currentResult.rows.length > 0) {
      console.log('📋 Current FAQ:');
      console.log(`   Question: ${currentResult.rows[0].question}`);
      console.log(`   Answer: ${currentResult.rows[0].answer}\n`);
    } else {
      console.log('⚠️  Support FAQ not found!\n');
    }

    console.log('🔧 Updating FAQ...');

    // Update FAQ
    const newAnswer = 'Visit our website at fngpay.com, join our Telegram group at t.me/+RpX8P-Z2eJ40MzQ1, or message @fngpay_bot on Telegram for instant support.';

    await client.query(`
      UPDATE faqs
      SET answer = $1
      WHERE question = 'How can I contact support?'
    `, [newAnswer]);

    console.log('✅ FAQ updated successfully!\n');

    console.log('📋 New FAQ:');
    console.log('   Question: How can I contact support?');
    console.log(`   Answer: ${newAnswer}\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Users will now see:');
    console.log('  - Website: fngpay.com');
    console.log('  - Telegram Group: t.me/+RpX8P-Z2eJ40MzQ1');
    console.log('  - Telegram Bot: @fngpay_bot');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

updateSupportFAQ().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
