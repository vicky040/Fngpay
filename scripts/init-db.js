#!/usr/bin/env node

/**
 * Database initialization script for production deployment.
 * Runs the schema and seed SQL files against DATABASE_URL.
 *
 * Usage:
 *   node scripts/init-db.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : undefined,
  });

  try {
    console.log('🔌 Connecting to database...');

    // Read SQL files
    const schemaPath = path.join(__dirname, '../docker/01_schema.sql');
    const seedPath = path.join(__dirname, '../docker/02_seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    console.log('📋 Running schema...');
    await pool.query(schemaSql);
    console.log('✅ Schema created successfully');

    console.log('🌱 Running seed data...');
    await pool.query(seedSql);
    console.log('✅ Seed data inserted successfully');

    console.log('\n🎉 Database initialization complete!');
    console.log('Demo login credentials:');
    console.log('  Agent Code: PV-G9KL27');
    console.log('  Email: arjunkumawat062@gmail.com');
    console.log('  Password: Payvora@123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
