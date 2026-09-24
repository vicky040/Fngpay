#!/usr/bin/env node

/**
 * Update exchange rate for PV-ADMIN from 110 to 104 INR/USDT
 */

const { Pool } = require('pg');

const AGENT_CODE = 'PV-ADMIN';
const NEW_RATE = 104.00;

async function updateExchangeRate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log(`🔧 Updating exchange rate for ${AGENT_CODE}...\n`);

    // Get agent ID
    const agentResult = await pool.query(
      'SELECT id FROM agents WHERE agent_code = $1',
      [AGENT_CODE]
    );

    if (agentResult.rows.length === 0) {
      console.log(`❌ Agent ${AGENT_CODE} not found`);
      return;
    }

    const agentId = agentResult.rows[0].id;

    // Get current rate
    const currentRate = await pool.query(
      'SELECT fixed_rate_inr FROM wallets WHERE agent_id = $1',
      [agentId]
    );

    console.log(`📊 Current Rate: ${currentRate.rows[0].fixed_rate_inr} INR/USDT`);
    console.log(`📊 New Rate: ${NEW_RATE} INR/USDT\n`);

    // Update rate
    await pool.query(
      'UPDATE wallets SET fixed_rate_inr = $1 WHERE agent_id = $2',
      [NEW_RATE, agentId]
    );

    console.log(`✅ Exchange rate updated successfully!\n`);

    // Verify
    const verify = await pool.query(
      'SELECT fixed_rate_inr, balance_usdt FROM wallets WHERE agent_id = $1',
      [agentId]
    );

    const balance = verify.rows[0].balance_usdt;
    const rate = verify.rows[0].fixed_rate_inr;
    const inrValue = (balance * rate).toFixed(2);

    console.log(`📋 Updated Wallet Info:`);
    console.log(`   Balance: ${balance} USDT`);
    console.log(`   Exchange Rate: ${rate} INR/USDT`);
    console.log(`   INR Value: ₹${parseFloat(inrValue).toLocaleString('en-IN')}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

updateExchangeRate();
