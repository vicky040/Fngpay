#!/usr/bin/env node

/**
 * Database Migration: Add Withdrawal System
 *
 * This migration adds:
 * 1. Enhanced payout_orders table with approval workflow fields
 * 2. system_settings table for exchange rate management
 */

const { Pool } = require('pg');

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL ||
      "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: true }
  });

  try {
    console.log('🔧 Starting migration: Add Withdrawal System\n');

    // Step 1: Enhance payout_orders table
    console.log('📊 Enhancing payout_orders table...');

    await pool.query(`
      ALTER TABLE payout_orders
      ADD COLUMN IF NOT EXISTS linked_bank_id INTEGER REFERENCES linked_banks(id),
      ADD COLUMN IF NOT EXISTS amount_usdt NUMERIC(18, 2),
      ADD COLUMN IF NOT EXISTS amount_inr NUMERIC(18, 2),
      ADD COLUMN IF NOT EXISTS exchange_rate NUMERIC(10, 2),
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES agents(id),
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
    `);

    console.log('✅ payout_orders table enhanced');

    // Step 2: Create system_settings table
    console.log('\n📊 Creating system_settings table...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now(),
        updated_by INTEGER REFERENCES agents(id)
      );
    `);

    console.log('✅ system_settings table created');

    // Step 3: Insert default exchange rate
    console.log('\n💱 Setting default exchange rate...');

    await pool.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('exchange_rate_inr_usdt', '104')
      ON CONFLICT (key) DO NOTHING;
    `);

    console.log('✅ Default exchange rate set to 104 INR/USDT');

    // Step 4: Verify migration
    console.log('\n🔍 Verifying migration...');

    const verifyPayoutOrders = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payout_orders'
      AND column_name IN ('linked_bank_id', 'amount_usdt', 'amount_inr', 'exchange_rate', 'approved_at', 'rejected_at', 'completed_at', 'approved_by', 'rejection_reason', 'updated_at');
    `);

    console.log(`   - payout_orders new columns: ${verifyPayoutOrders.rows.length}/10`);

    const verifySystemSettings = await pool.query(`
      SELECT * FROM system_settings WHERE key = 'exchange_rate_inr_usdt';
    `);

    console.log(`   - system_settings: ${verifySystemSettings.rows.length > 0 ? '✅ Exists' : '❌ Missing'}`);
    if (verifySystemSettings.rows.length > 0) {
      console.log(`   - Exchange rate: ${verifySystemSettings.rows[0].value} INR/USDT`);
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('   ✅ payout_orders table enhanced with approval workflow');
    console.log('   ✅ system_settings table created');
    console.log('   ✅ Default exchange rate set (104 INR/USDT)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
