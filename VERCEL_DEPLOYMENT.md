# Vercel Deployment Guide

## Prerequisites

1. A Vercel account
2. A Postgres database (Vercel Postgres or external)

## Step 1: Set up Postgres Database

### Option A: Using Vercel Postgres
1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → **Postgres**
4. Follow the prompts to create your database
5. Vercel will automatically add `DATABASE_URL` to your environment variables

### Option B: Using External Postgres
1. Get your database connection string
2. Add it to Vercel environment variables as `DATABASE_URL`

## Step 2: Initialize the Database Schema

After your database is created, you need to run the initialization script:

### Method 1: Via Vercel CLI (Recommended)
```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Pull environment variables
vercel env pull .env.local

# Run the initialization script locally (it will connect to your Vercel Postgres)
npm run db:init
```

### Method 2: Via Direct Database Connection
Connect to your Postgres database using `psql` or a GUI tool and run:
1. `docker/01_schema.sql` - Creates all tables
2. `docker/02_seed.sql` - Inserts demo data

Example using psql:
```bash
psql "your-connection-string" -f docker/01_schema.sql
psql "your-connection-string" -f docker/02_seed.sql
```

## Step 3: Set Required Environment Variables

Make sure these environment variables are set in Vercel:

```
DATABASE_URL=postgresql://...
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret
NOWPAYMENTS_API_KEY=your-nowpayments-api-key
NOWPAYMENTS_IPN_SECRET=your-ipn-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/google/callback
SESSION_SECRET=your-random-secret-key
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

## Step 4: Deploy

```bash
# Deploy to Vercel
vercel --prod
```

Or push to your connected GitHub repository to trigger automatic deployment.

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Try logging in with demo credentials:
   - **Agent Code**: `PV-G9KL27`
   - **Email**: `arjunkumawat062@gmail.com`
   - **Password**: `Payvora@123`

## Troubleshooting

### "relation does not exist" error
- Run the database initialization script: `npm run db:init`

### SSL connection issues
- Make sure `DATABASE_URL` includes `?sslmode=require` for production
- The app automatically enables SSL for production environments

### Database connection pool errors
- Vercel Postgres has connection limits
- The app uses connection pooling to minimize connections
- Consider upgrading your database plan if you hit limits

## Database Migrations

For future schema changes:
1. Create a new SQL file (e.g., `03_add_feature.sql`)
2. Run it against your production database
3. Consider using a migration tool like `node-pg-migrate` for complex projects
