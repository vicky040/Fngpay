# Telegram Bot Description Auto-Fix Cron Job

This cron job automatically checks and fixes the Telegram bot description every 5 minutes.

## How It Works

1. **Cron runs every 5 minutes** (configured in `vercel.json`)
2. **Checks current bot description** via Telegram API
3. **If description is wrong**, automatically updates it to the correct one
4. **Logs the action** in your deployment logs

## Setup Instructions

### Step 1: Deploy to Vercel

The `vercel.json` file is already configured with the cron schedule:
```json
{
  "crons": [
    {
      "path": "/api/cron/fix-bot-description",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Step 2: Set Environment Variable (Optional)

For extra security, set a cron secret in Vercel:

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add new variable:
   - **Name:** `CRON_SECRET`
   - **Value:** `fngpay-cron-secret-2024` (or any secret string you want)
   - **Environment:** Production

If you don't set this, it will use the default secret in the code.

### Step 3: Verify Cron is Working

After deploying, the cron will run automatically. You can:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for messages like:
     - `✅ Bot description is correct - no action needed`
     - `⚠️ Bot description is incorrect - fixing now...`
     - `✅ Bot description fixed successfully!`

2. **Manual Test (Before Cron Runs):**
   ```bash
   curl -H "Authorization: Bearer fngpay-cron-secret-2024" \
     https://fngpay.com/api/cron/fix-bot-description
   ```

## How to Update the Correct Description

If you want to change what the "correct" description should be:

1. Edit `app/api/cron/fix-bot-description/route.ts`
2. Update the `CORRECT_DESCRIPTION` constant (line 6)
3. Commit and deploy

## Cron Schedule

- **Current:** Every 5 minutes (`*/5 * * * *`)
- **To change frequency:**
  - Edit `vercel.json`
  - Examples:
    - Every 10 minutes: `*/10 * * * *`
    - Every hour: `0 * * * *`
    - Every 30 minutes: `*/30 * * * *`

## Troubleshooting

### Cron not running?

1. Check Vercel Dashboard → Cron Jobs tab
2. Verify the cron is enabled
3. Check deployment logs for errors

### Description still changing?

- The cron can only fix it every 5 minutes
- If someone changes it, it will be fixed within 5 minutes
- Consider making the GitHub repository private to prevent token theft

### Need to disable the cron?

Remove the cron configuration from `vercel.json` and redeploy.

## Security Note

⚠️ **This is a workaround!** The real solution is to:
1. Make your GitHub repository **PRIVATE**
2. Or create a **NEW bot** with a secret token

As long as your bot token is public, anyone can control your bot.
