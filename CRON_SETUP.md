# Telegram Bot Description Auto-Fix Cron Job

This cron job automatically checks and fixes the Telegram bot description every 5 minutes using an **external free cron service**.

## Why External Cron?

Vercel Hobby (free) plan only allows **daily** cron jobs, not every 5 minutes. So we use a free external service to call our API every 5 minutes.

## How It Works

1. **External cron service** calls our API every 5 minutes
2. **API checks** current bot description via Telegram API
3. **If description is wrong**, automatically updates it to the correct one
4. **Logs the action** in your deployment logs

---

## Setup Instructions

### Step 1: Deploy Your API to Vercel

The API endpoint is already created at:
```
https://fngpay.com/api/cron/fix-bot-description
```

Just deploy your code to Vercel (no special config needed).

### Step 2: Set Up Free External Cron Service

Choose one of these **FREE** options:

---

#### **Option A: cron-job.org (Recommended - Easiest)**

1. Go to: https://cron-job.org/en/
2. Click **"Sign Up"** (free account)
3. After login, click **"Create cron job"**
4. Fill in:
   - **Title:** `Fix FNGPay Bot Description`
   - **URL:** `https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024`
   - **Schedule:**
     - Every: **5 minutes**
   - **Notifications:** Enable email on failure (optional)
5. Click **"Create"**
6. Done! ✅

**Advantages:**
- Very reliable
- Easy to set up
- See execution history
- Email alerts on failures

---

#### **Option B: EasyCron (Alternative)**

1. Go to: https://www.easycron.com/
2. Sign up (free plan allows 1 cron job)
3. Add Cron Job:
   - **URL:** `https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024`
   - **Cron Expression:** `*/5 * * * *` (every 5 minutes)
4. Save and enable
5. Done! ✅

---

#### **Option C: UptimeRobot (Also Free)**

1. Go to: https://uptimerobot.com/
2. Sign up (free account)
3. Add New Monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** `FNGPay Bot Fix`
   - **URL:** `https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024`
   - **Monitoring Interval:** 5 minutes
4. Create Monitor
5. Done! ✅

**Note:** UptimeRobot is designed for uptime monitoring, but works perfectly as a cron scheduler too!

---

### Step 3: Test It Manually

Before waiting 5 minutes, test the API now:

**Option 1: Browser**
```
https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024
```

**Option 2: cURL**
```bash
curl "https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024"
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Bot description is correct",
  "checked_at": "2024-09-29T12:34:56.789Z"
}
```

Or if it was fixed:
```json
{
  "status": "fixed",
  "message": "Bot description was incorrect and has been fixed",
  "fixed_at": "2024-09-29T12:34:56.789Z"
}
```

---

### Step 4: Monitor Logs (Optional)

Check Vercel logs to see the cron in action:
1. Go to Vercel Dashboard → Your Project → Logs
2. Every 5 minutes you'll see:
   - ✅ `Bot description is correct - no action needed`
   - ⚠️ `Bot description is incorrect - fixing now...`
   - ✅ `Bot description fixed successfully!`

---

## How to Update the Correct Description

If you want to change what the "correct" description should be:

1. Edit `app/api/cron/fix-bot-description/route.ts`
2. Update the `CORRECT_DESCRIPTION` constant (around line 6)
3. Commit and deploy

---

## Security

### Change the Secret (Recommended)

The default secret is `fngpay-cron-secret-2024`. To change it:

**Option 1: Update in Code**
Edit `app/api/cron/fix-bot-description/route.ts` line:
```typescript
const cronSecret = process.env.CRON_SECRET || "YOUR_NEW_SECRET_HERE";
```

**Option 2: Use Environment Variable**
1. Vercel Dashboard → Settings → Environment Variables
2. Add: `CRON_SECRET` = `your-new-secret-here`
3. Update your cron service URL with new secret

---

## Troubleshooting

### ❌ Getting "Unauthorized" error?

Make sure your URL includes the secret:
```
https://fngpay.com/api/cron/fix-bot-description?secret=fngpay-cron-secret-2024
```

### ❌ Description still changing?

- The cron can only fix it every 5 minutes
- If someone changes it at 12:00, it will be fixed by 12:05
- Check your cron service dashboard to verify it's running

### ❌ Cron service not calling the API?

1. Check your cron service dashboard
2. Verify the URL is correct
3. Test the URL manually in browser
4. Check if there are any error notifications

---

## How Often Does It Run?

- **Every 5 minutes** = 288 times per day
- **Cost:** FREE on all services mentioned
- **Reliability:** Very high (these services are designed for this)

---

## Security Note

⚠️ **This is still a workaround!** The real solution is to:
1. Make your GitHub repository **PRIVATE** so the token isn't exposed
2. Or create a **NEW bot** with a secret token

As long as your bot token is public, anyone can control your bot. This cron just fixes it quickly after they change it.
