#!/usr/bin/env node

/**
 * Database Migration: Add Full Account Number to linked_banks
 *
 * Adds account_number field to store full account numbers
 * so admin can make payments
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function migrate() {
  try {
    console.log('🔧 Starting migration: Add Full Account Number\n');

    // Add account_number column if it doesn't exist
    console.log('📊 Adding account_number column to linked_banks...');
    await pool.query(`
      ALTER TABLE linked_banks
      ADD COLUMN IF NOT EXISTS account_number TEXT;
    `);
    console.log('✅ Column added successfully\n');

    console.log('✅ Migration completed successfully!');
    console.log('\nNote: Existing bank accounts will show partial account numbers.');
    console.log('New bank accounts added will store full account numbers.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(console.error);
