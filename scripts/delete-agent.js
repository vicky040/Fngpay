#!/usr/bin/env node

/**
 * Delete a specific agent code from telegram_onboarding_sessions
 * Usage: node scripts/delete-agent.js PV-X8TC2M
 */

const { Pool } = require('pg');

const AGENT_CODE = process.argv[2] || 'PV-X8TC2M';

async function deleteAgent() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🔍 Looking for Agent ID: ${AGENT_CODE}`);

    // Check if record exists
    const checkResult = await pool.query(
      'SELECT id, chat_id, agent_code, status, credited_at, claimed_at FROM telegram_onboarding_sessions WHERE agent_code = $1',
      [AGENT_CODE]
    );

    if (checkResult.rows.length === 0) {
      console.log(`❌ Agent ID ${AGENT_CODE} not found in database`);
      return;
    }

    console.log(`\n📋 Found record:`);
    console.log(checkResult.rows[0]);

    // Delete the record
    const deleteResult = await pool.query(
      'DELETE FROM telegram_onboarding_sessions WHERE agent_code = $1',
      [AGENT_CODE]
    );

    console.log(`\n✅ Deleted ${deleteResult.rowCount} record(s)`);
    console.log(`✨ Agent ID ${AGENT_CODE} has been removed from the database`);
    console.log(`\n💡 The user can now message the bot again to get a new Agent ID`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

deleteAgent();
