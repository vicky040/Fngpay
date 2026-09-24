#!/usr/bin/env node

/**
 * Mark security deposit as completed for PV-ADMIN and PV-ADMIN1
 */

const { Pool } = require('pg');

async function completeSecurityDeposit() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🔧 Updating security deposit status...\n`);

    // Update both accounts
    const result = await pool.query(
      `UPDATE agents
       SET security_deposit_completed = TRUE
       WHERE agent_code IN ('PV-ADMIN', 'PV-ADMIN1')`
    );

    console.log(`✅ Updated ${result.rowCount} account(s)\n`);

    // Verify
    const verify = await pool.query(
      `SELECT agent_code, full_name, security_deposit_completed, two_factor_enabled
       FROM agents
       WHERE agent_code IN ('PV-ADMIN', 'PV-ADMIN1')
       ORDER BY agent_code`
    );

    console.log(`📋 Account Status:`);
    verify.rows.forEach(row => {
      console.log(`   ${row.agent_code}:`);
      console.log(`     Name: ${row.full_name}`);
      console.log(`     Security Deposit: ${row.security_deposit_completed ? '✅ Completed' : '❌ Pending'}`);
      console.log(`     2FA: ${row.two_factor_enabled ? '✅ Enabled' : '❌ Disabled'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

completeSecurityDeposit();
