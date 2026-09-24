#!/usr/bin/env node

/**
 * Create PV-ADMIN agent code for free registration
 * This agent code can be used to register without payment
 */

const { Pool } = require('pg');

const ADMIN_AGENT_CODE = 'PV-ADMIN';

async function createAdminAgent() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🔧 Creating admin agent code: ${ADMIN_AGENT_CODE}`);

    // Check if it already exists
    const existing = await pool.query(
      'SELECT id, agent_code, status, credited_at, claimed_at FROM telegram_onboarding_sessions WHERE agent_code = $1',
      [ADMIN_AGENT_CODE]
    );

    if (existing.rows.length > 0) {
      console.log(`\n⚠️  Agent code ${ADMIN_AGENT_CODE} already exists:`);
      console.log(existing.rows[0]);

      // Update it to be usable
      await pool.query(
        `UPDATE telegram_onboarding_sessions
         SET status = 'completed',
             credited_at = NOW(),
             claimed_at = NULL
         WHERE agent_code = $1`,
        [ADMIN_AGENT_CODE]
      );
      console.log(`\n✅ Updated ${ADMIN_AGENT_CODE} to be reusable`);
    } else {
      // Create new admin agent code
      await pool.query(
        `INSERT INTO telegram_onboarding_sessions
         (chat_id, telegram_username, agent_code, payment_id, order_id,
          pay_currency, price_amount, price_currency, provider_status,
          status, credited_at, claimed_at)
         VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NULL)`,
        [
          0, // Special chat_id for admin
          'ADMIN',
          ADMIN_AGENT_CODE,
          'ADMIN-' + Date.now(),
          'ADMIN-ORDER',
          'usdttrc20',
          0, // No payment required
          'usdttrc20',
          'completed',
          'completed'
        ]
      );
      console.log(`\n✅ Created ${ADMIN_AGENT_CODE} successfully!`);
    }

    // Verify
    const verify = await pool.query(
      'SELECT id, agent_code, status, credited_at, claimed_at FROM telegram_onboarding_sessions WHERE agent_code = $1',
      [ADMIN_AGENT_CODE]
    );

    console.log(`\n📋 Admin Agent Code Details:`);
    console.log(`  Agent Code: ${verify.rows[0].agent_code}`);
    console.log(`  Status: ${verify.rows[0].status}`);
    console.log(`  Credited At: ${verify.rows[0].credited_at}`);
    console.log(`  Claimed At: ${verify.rows[0].claimed_at || 'NULL (Available for use)'}`);

    console.log(`\n✨ ${ADMIN_AGENT_CODE} is ready!`);
    console.log(`\n📝 Usage:`);
    console.log(`  - Users can register with agent code: ${ADMIN_AGENT_CODE}`);
    console.log(`  - No payment required`);
    console.log(`  - No Telegram bot interaction needed`);
    console.log(`  - Direct registration on website`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createAdminAgent();
