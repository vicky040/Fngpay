# Environment Variables Setup Guide

## 🔐 Required Environment Variables

You need to add the following environment variables to your Vercel project:

### 1. **Telegram Bot Credentials** (REQUIRED)

```env
TELEGRAM_BOT_TOKEN=8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q
TELEGRAM_BOT_USERNAME=Fngpay_official_bot
```

**What these do:**
- `TELEGRAM_BOT_TOKEN`: Your bot's authentication token from BotFather
- `TELEGRAM_BOT_USERNAME`: Your bot's username (without @)

**Where to add them:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - Variable name: `TELEGRAM_BOT_TOKEN`
   - Value: `8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q`
   - Environment: Production, Preview, Development (select all)
3. Repeat for `TELEGRAM_BOT_USERNAME`

### 2. **Other Environment Variables**

These should already be configured in your Vercel project:

```env
# Database
DATABASE_URL=postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require

# NOWPayments API
NOWPAYMENTS_API_KEY=your_nowpayments_api_key

# Cron Secret
CRON_SECRET=fngpay-cron-secret-2024

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Next.js Base URL
NEXT_PUBLIC_BASE_URL=https://fngpay.vercel.app
```

---

## 🚀 Deployment Steps

### Step 1: Add Environment Variables to Vercel

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project (Fngpay)

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in the sidebar

3. **Add the two new variables:**
   
   **Variable 1:**
   - Name: `TELEGRAM_BOT_TOKEN`
   - Value: `8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

   **Variable 2:**
   - Name: `TELEGRAM_BOT_USERNAME`
   - Value: `Fngpay_official_bot`
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click "Save"

### Step 2: Redeploy Your Application

After adding environment variables, you need to redeploy:

**Option A: Automatic (Recommended)**
- Push the changes from git (already done ✓)
- Vercel will auto-deploy the new code
- Wait for deployment to complete

**Option B: Manual Redeploy**
- Go to Vercel Dashboard → Deployments
- Click the three dots on the latest deployment
- Click "Redeploy"
- Check "Use existing Build Cache" → Redeploy

### Step 3: Setup Webhook for New Bot

Once deployed, register the webhook:

**Open this URL in your browser:**
```
https://api.telegram.org/bot8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q/setWebhook?url=https://fngpay.vercel.app/api/telegram/webhook
```

**Expected response:**
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Step 4: Verify Webhook

**Check webhook status:**
```
https://api.telegram.org/bot8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q/getWebhookInfo
```

**Should show:**
```json
{
  "ok": true,
  "result": {
    "url": "https://fngpay.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Step 5: Test the Bot

1. Open Telegram
2. Search for `@Fngpay_official_bot`
3. Send `/start`
4. Bot should respond with welcome message

---

## 🔍 Verification Checklist

After deployment, verify everything works:

- [ ] Vercel deployment successful
- [ ] Environment variables added (check Settings → Environment Variables)
- [ ] Webhook registered (check getWebhookInfo URL)
- [ ] Bot responds to `/start` command
- [ ] Bot username shows as `@Fngpay_official_bot` in the app
- [ ] Help page shows correct bot username
- [ ] FAQ shows correct bot username

---

## 📝 What Changed?

### Before (INSECURE):
```typescript
const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw"; // ❌ Hardcoded
const BOT_USERNAME = "fngpay_bot"; // ❌ Hardcoded
```

### After (SECURE):
```typescript
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // ✅ Environment variable
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME; // ✅ Environment variable
```

### Files Updated:
1. `lib/telegram.ts` - Main Telegram library
2. `app/api/cron/fix-bot-description/route.ts` - Cron endpoint
3. `app/api/telegram/start/route.ts` - Start redirect
4. `scripts/fix-bot-bio.js` - Bio fix script
5. `scripts/fix-last-payment.js` - Payment fix script
6. `docker/02_seed.sql` - Database seed
7. `scripts/update-support-faq.js` - FAQ update script
8. `app/(shell)/help/page.tsx` - Help page
9. `TELEGRAM_WEBHOOK_SETUP.md` - Documentation

---

## 🆘 Troubleshooting

### Bot not responding

**Check 1: Environment variables set?**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# Verify TELEGRAM_BOT_TOKEN exists
```

**Check 2: Deployment successful?**
```bash
# Vercel Dashboard → Deployments
# Check latest deployment status
```

**Check 3: Webhook registered?**
```
# Open in browser:
https://api.telegram.org/bot8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q/getWebhookInfo
```

### Webhook errors

**Solution: Delete and re-register webhook**
```
# Step 1: Delete webhook
https://api.telegram.org/bot8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q/deleteWebhook

# Step 2: Set webhook again
https://api.telegram.org/bot8799087137:AAFe-MwkBuD1hLnC7r0D0n0m1ZLy8qyk1q/setWebhook?url=https://fngpay.vercel.app/api/telegram/webhook
```

### Wrong bot showing in app

**Solution: Clear cache and redeploy**
```bash
# Vercel Dashboard → Deployments → Redeploy
# Uncheck "Use existing Build Cache"
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ Vercel deployment shows "Ready"
2. ✅ Environment variables visible in Vercel settings
3. ✅ Webhook URL returns `{"ok":true}`
4. ✅ Bot responds to `/start` in Telegram
5. ✅ Help page shows `@Fngpay_official_bot`
6. ✅ No errors in Vercel logs

---

## 🔒 Security Notes

**Why this is more secure:**
- ✅ Bot token not visible in source code
- ✅ Token not in git history (only new one, old one was in git)
- ✅ Easy to rotate credentials without code changes
- ✅ Different tokens for production/staging/development
- ✅ Follows industry best practices

**Important:**
- Never commit .env file to git
- Never share bot token publicly
- Rotate token if exposed
- Use different tokens for different environments

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Verify all environment variables are set
3. Test webhook URL directly
4. Check bot responds in Telegram
5. Review this guide again

---

**Last Updated:** October 11, 2026  
**New Bot:** @Fngpay_official_bot  
**Token:** Stored securely in environment variables ✅
