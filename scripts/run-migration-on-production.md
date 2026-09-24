# Run Migration on Production

The database migration needs to be run to add the withdrawal system columns.

## Option 1: Run via Vercel CLI (if installed)

```bash
vercel env pull .env.local
node scripts/migrate-add-withdrawal-system.js
```

## Option 2: Run locally with production database

```bash
# Make sure DATABASE_URL in .env points to production
node scripts/migrate-add-withdrawal-system.js
```

## Option 3: Create a temporary API endpoint

We can create a temporary endpoint that runs the migration when called.

## What the migration does:

1. Adds columns to `payout_orders` table:
   - linked_bank_id
   - amount_usdt
   - amount_inr
   - exchange_rate
   - approved_at
   - rejected_at
   - completed_at
   - approved_by
   - rejection_reason
   - updated_at

2. Creates `system_settings` table with exchange rate

3. Sets default exchange rate to 104 INR/USDT
