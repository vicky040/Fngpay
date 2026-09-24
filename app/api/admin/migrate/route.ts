import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAdmin } from "@/lib/api-admin-auth";

/**
 * Migration endpoint - Run database migration
 * Only accessible by admin (PV-ADMIN1)
 */
export async function POST() {
  const auth = await requireApiAdmin();
  if ('error' in auth) return auth.error;

  try {
    console.log('Starting database migration...');

    // Step 1: Enhance payout_orders table
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

    // Step 2: Create system_settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT now(),
        updated_by INTEGER REFERENCES agents(id)
      );
    `);

    // Step 3: Insert default exchange rate
    await pool.query(`
      INSERT INTO system_settings (key, value)
      VALUES ('exchange_rate_inr_usdt', '104')
      ON CONFLICT (key) DO NOTHING;
    `);

    // Verify
    const verifyPayoutOrders = await pool.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'payout_orders'
      AND column_name IN ('linked_bank_id', 'amount_usdt', 'amount_inr', 'exchange_rate', 'approved_at', 'rejected_at', 'completed_at', 'approved_by', 'rejection_reason', 'updated_at');
    `);

    const verifySystemSettings = await pool.query(`
      SELECT * FROM system_settings WHERE key = 'exchange_rate_inr_usdt';
    `);

    console.log('Migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      results: {
        payoutOrdersColumns: verifyPayoutOrders.rows.length,
        systemSettingsExists: verifySystemSettings.rows.length > 0,
        exchangeRate: verifySystemSettings.rows[0]?.value || null,
      }
    });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
