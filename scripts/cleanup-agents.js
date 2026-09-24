#!/usr/bin/env node

/**
 * Delete all agents except PV-ADMIN1
 * This will cascade delete related data (sessions, wallets, etc.)
 */

const { Pool } = require('pg');

const KEEP_AGENT = 'PV-ADMIN1';

async function cleanupAgents() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🔍 Finding all agents except ${KEEP_AGENT}...`);

    // First, show all current agents
    const allAgents = await pool.query(
      'SELECT id, agent_code, full_name, email FROM agents ORDER BY id'
    );

    console.log(`\n📋 Current agents in database (${allAgents.rows.length} total):`);
    allAgents.rows.forEach(agent => {
      console.log(`  - ${agent.agent_code}: ${agent.full_name} (${agent.email})`);
    });

    // Find agents to delete
    const toDelete = await pool.query(
      'SELECT id, agent_code, full_name, email FROM agents WHERE agent_code != $1',
      [KEEP_AGENT]
    );

    if (toDelete.rows.length === 0) {
      console.log(`\n✅ No agents to delete. Only ${KEEP_AGENT} exists.`);
      return;
    }

    console.log(`\n🗑️  Agents to be deleted (${toDelete.rows.length}):`);
    toDelete.rows.forEach(agent => {
      console.log(`  - ${agent.agent_code}: ${agent.full_name} (${agent.email})`);
    });

    // Delete agents (CASCADE will handle related records)
    const deleteResult = await pool.query(
      'DELETE FROM agents WHERE agent_code != $1',
      [KEEP_AGENT]
    );

    console.log(`\n✅ Deleted ${deleteResult.rowCount} agent(s)`);

    // Also clean up telegram onboarding sessions
    const telegramCleanup = await pool.query(
      'DELETE FROM telegram_onboarding_sessions WHERE agent_code IS NOT NULL AND agent_code != $1',
      [KEEP_AGENT]
    );

    console.log(`✅ Deleted ${telegramCleanup.rowCount} telegram onboarding session(s)`);

    // Show remaining agents
    const remaining = await pool.query(
      'SELECT id, agent_code, full_name, email FROM agents ORDER BY id'
    );

    console.log(`\n📋 Remaining agents (${remaining.rows.length}):`);
    remaining.rows.forEach(agent => {
      console.log(`  - ${agent.agent_code}: ${agent.full_name} (${agent.email})`);
    });

    console.log(`\n✨ Database cleaned! Only ${KEEP_AGENT} remains.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

cleanupAgents();
