# Telegram Bot Setup Guide (Mobile Phone)

## 📱 Part 1: Create Telegram Bot (5 minutes)

### Step 1: Open Telegram App
1. Open **Telegram** app on your phone
2. Go to the **Search** bar at top

### Step 2: Find BotFather
1. Search for: `@BotFather`
2. Look for the bot with **blue checkmark** (official Telegram bot)
3. Tap on it to open the chat

### Step 3: Start BotFather
1. Tap the **START** button at the bottom
2. You'll see a list of commands

### Step 4: Create New Bot
1. Type or tap: `/newbot`
2. Send the message
3. BotFather will ask: "Alright, a new bot. How are we going to call it?"

### Step 5: Name Your Bot
1. Think of a display name (can contain spaces)
   - Example: `Fngpay Partner Bot`
   - Example: `My Payment Bot`
2. Type the name and send

### Step 6: Choose Username
1. BotFather asks for username (must end in 'bot')
   - Example: `fngpay_partner_bot`
   - Example: `mypayment_bot`
2. **Important**: Write this down! You'll need it later
3. If name is taken, try another one

### Step 7: Get Your Bot Token
1. BotFather sends you a message with:
   ```
   Done! Congratulations on your new bot...
   
   Use this token to access the HTTP API:
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   
   Keep your token secure...
   ```

2. **COPY THIS TOKEN** - This is your `TELEGRAM_BOT_TOKEN`
   - Long press on the token
   - Select "Copy"
   - **Save it somewhere safe** (Notes app, email to yourself)

3. **DON'T SHARE THIS TOKEN** - Anyone with it can control your bot!

### ✅ What You Have Now:
```
Bot Name: Fngpay Partner Bot
Username: @fngpay_partner_bot
Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
```

---

## 💳 Part 2: Set Up NOWPayments (10 minutes)

### Step 1: Create NOWPayments Account
1. Open browser on your phone
2. Go to: https://account.nowpayments.io/
3. Click **Sign Up**
4. Fill in:
   - Email
   - Password
   - Confirm password
5. Check your email for verification link
6. Click the link to verify

### Step 2: Complete Profile
1. Log in to NOWPayments
2. Complete KYC if required (depends on country)
3. Navigate to dashboard

### Step 3: Get API Key
1. Click **Settings** (gear icon)
2. Click **API keys**
3. You'll see: `API Key: xxxxxxxxxxxxxxxx`
4. Click **Show** or **Copy**
5. **Save this key** - This is your `NOWPAYMENTS_API_KEY`

### Step 4: Set Up IPN (Payment Notifications)
1. In Settings, find **IPN (Instant Payment Notifications)**
2. Click **Add IPN**
3. **Wait** - You need your app URL first (we'll come back to this)

### Step 5: Generate IPN Secret
1. In IPN settings
2. Find **IPN Secret Key**
3. Click **Generate** if not already generated
4. **Save this secret** - This is your `NOWPAYMENTS_IPN_SECRET`

### ✅ What You Have Now:
```
API Key: abc123...xyz789
IPN Secret: secret123...abc789
```

### 💡 Sandbox Mode (For Testing)
If you want to test without real money first:
1. Go to: https://account-sandbox.nowpayments.io/
2. Create a separate sandbox account
3. Get sandbox API keys
4. Set `NOWPAYMENTS_SANDBOX=true` in environment

---

## 🚀 Part 3: Configure Vercel (15 minutes)

### Step 1: Open Vercel Dashboard
1. On your phone or computer browser
2. Go to: https://vercel.com
3. Log in to your account
4. Find your project: `Fngpay` or `usdt`

### Step 2: Go to Environment Variables
1. Click on your project
2. Click **Settings** tab (top menu)
3. Click **Environment Variables** (left sidebar)

### Step 3: Add Telegram Bot Token
1. Click **Add New**
2. **Name**: `TELEGRAM_BOT_TOKEN`
3. **Value**: Paste the token from BotFather
   ```
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789
   ```
4. **Environment**: Select **Production**, **Preview**, **Development**
5. Click **Save**

### Step 4: Add Bot Username
1. Click **Add New** again
2. **Name**: `TELEGRAM_BOT_USERNAME`
3. **Value**: Your bot username (WITHOUT @)
   ```
   fngpay_partner_bot
   ```
   (If your bot is @fngpay_partner_bot, just enter: fngpay_partner_bot)
4. **Environment**: All three
5. Click **Save**

### Step 5: Generate Webhook Secret
1. Open browser, go to: https://randomkeygen.com/
2. Copy any "CodeIgniter Encryption Key" or "256-bit WPA Key"
3. Or create your own random string (at least 32 characters)

### Step 6: Add Webhook Secret
1. In Vercel, click **Add New**
2. **Name**: `TELEGRAM_WEBHOOK_SECRET`
3. **Value**: Paste the random secret you generated
   ```
   k8x9m2p5q7w1e4r6t8y0u3i5o7a9s2d4f6
   ```
4. **Environment**: All three
5. Click **Save**

### Step 7: Add NOWPayments API Key
1. Click **Add New**
2. **Name**: `NOWPAYMENTS_API_KEY`
3. **Value**: Paste your NOWPayments API key
4. **Environment**: All three
5. Click **Save**

### Step 8: Add NOWPayments IPN Secret
1. Click **Add New**
2. **Name**: `NOWPAYMENTS_IPN_SECRET`
3. **Value**: Paste your NOWPayments IPN secret
4. **Environment**: All three
5. Click **Save**

### Step 9: Add Sandbox Mode (Optional)
If using NOWPayments sandbox for testing:
1. Click **Add New**
2. **Name**: `NOWPAYMENTS_SANDBOX`
3. **Value**: `true`
4. **Environment**: All three
5. Click **Save**

**Remove this or set to `false` when going to production!**

### ✅ Environment Variables Summary:
```
TELEGRAM_BOT_TOKEN          → From BotFather
TELEGRAM_BOT_USERNAME       → Your bot username (no @)
TELEGRAM_WEBHOOK_SECRET     → Random string you generated
NOWPAYMENTS_API_KEY        → From NOWPayments dashboard
NOWPAYMENTS_IPN_SECRET     → From NOWPayments IPN settings
NOWPAYMENTS_SANDBOX        → true (for testing) or false
DATABASE_URL               → (Already set)
```

### Step 10: Redeploy Your App
1. After adding all variables, Vercel will ask to redeploy
2. Click **Redeploy** or it will auto-redeploy
3. Wait 1-2 minutes for deployment to complete
4. Note your app URL: `https://your-app-name.vercel.app`

---

## 🔗 Part 4: Connect Telegram Webhook (5 minutes)

### Method A: Using Your Phone Browser

1. **Get Your App URL**
   - Example: `https://fngpay.vercel.app`

2. **Open Browser on Phone**

3. **Copy and Paste This URL** (replace the parts in CAPITAL):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=YOUR_APP_URL/api/telegram/webhook&secret_token=YOUR_WEBHOOK_SECRET
   ```

4. **Replace These Values**:
   - `YOUR_BOT_TOKEN` → Your actual bot token
   - `YOUR_APP_URL` → Your Vercel app URL
   - `YOUR_WEBHOOK_SECRET` → The random secret you generated

5. **Example**:
   ```
   https://api.telegram.org/bot1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789/setWebhook?url=https://fngpay.vercel.app/api/telegram/webhook&secret_token=k8x9m2p5q7w1e4r6t8y0u3i5o7a9s2d4f6
   ```

6. **Open the URL in browser**
   - You should see:
   ```json
   {"ok":true,"result":true,"description":"Webhook was set"}
   ```

7. **If you see that** ✅ - Webhook is connected!

### Method B: Using Telegram API Tool Bot

1. Search for `@BotAPIToolBot` in Telegram
2. Start the bot
3. Tap `/setWebhook`
4. Enter your webhook URL when asked:
   ```
   https://fngpay.vercel.app/api/telegram/webhook
   ```
5. Enter your secret token when asked
6. Done!

---

## 🔔 Part 5: Configure NOWPayments IPN URL

### Step 1: Go Back to NOWPayments
1. Open NOWPayments dashboard
2. Go to **Settings** → **IPN**

### Step 2: Add IPN Callback URL
1. Find **IPN Callback URL** field
2. Enter:
   ```
   https://your-app-name.vercel.app/api/telegram/payment-webhook
   ```
   Replace `your-app-name` with your actual Vercel URL

3. Example:
   ```
   https://fngpay.vercel.app/api/telegram/payment-webhook
   ```

4. Click **Save**

### ✅ Done!

---

## 🧪 Part 6: Test Your Bot (5 minutes)

### Step 1: Message Your Bot
1. Open Telegram on your phone
2. Search for your bot: `@fngpay_partner_bot` (your username)
3. Open the chat
4. Tap **START**
5. Or type any message: "Hi"

### Step 2: What Should Happen
1. Bot should reply with welcome message:
   ```
   👋 Welcome to Fngpay P2P!
   
   Thanks for reaching out about Partner Panel access...
   ```

2. Then bot should send:
   - QR code image
   - Payment address (USDT TRC20)
   - Amount: 200 USDT

### ✅ If You See This - Bot is Working!

### ❌ If Bot Doesn't Respond

#### Check 1: Webhook Connection
1. Open browser
2. Go to:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
   ```
   (Replace YOUR_BOT_TOKEN with your token)

3. You should see:
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

4. Look for errors in the response

#### Check 2: Vercel Deployment Logs
1. Go to Vercel dashboard
2. Click your project
3. Click **Deployments** tab
4. Click latest deployment
5. Click **Functions** tab
6. Look for `/api/telegram/webhook` errors

#### Check 3: Environment Variables
1. Verify all variables are set correctly in Vercel
2. No typos in variable names
3. No extra spaces in values

---

## 🎯 Part 7: Test Payment Flow (Optional - Requires Real USDT)

### Step 1: Get Test USDT
If using sandbox:
- Sandbox payments are instant
- No real crypto needed

If using production:
- Need real USDT TRC20
- Small test: 200 USDT

### Step 2: Make Payment
1. Copy the payment address from bot
2. Open your crypto wallet (Trust Wallet, Binance, etc.)
3. Send 200 USDT (TRC20 network)
4. Wait for blockchain confirmation (1-30 minutes)

### Step 3: Receive Agent ID
1. Bot will message you:
   ```
   ✅ Payment confirmed!
   
   Your Agent ID is: PV-X7H9K2
   
   Go back to the site and register...
   ```

2. **Save this Agent ID!**

### Step 4: Register on Website
1. Go to your app: `https://fngpay.vercel.app/register`
2. Fill in form with Agent ID from bot
3. Complete registration
4. Set up authenticator (2FA)

### ✅ Account Created!

---

## 📋 Quick Reference Card

Save this for future reference:

```
┌─────────────────────────────────────────┐
│         YOUR BOT CREDENTIALS            │
├─────────────────────────────────────────┤
│ Bot Name: ________________________      │
│ Username: @_______________________      │
│ Token: ____________________________     │
│         ____________________________    │
│                                         │
│ Webhook URL:                            │
│ https://_____.vercel.app/api/telegram/  │
│        webhook                          │
│                                         │
│ Webhook Secret: ___________________     │
│                                         │
│ NOWPayments API: __________________     │
│ NOWPayments IPN: __________________     │
└─────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: "Bot doesn't respond"
**Solution:**
- Wait 2-3 minutes after deployment
- Check webhook is set: `/getWebhookInfo`
- Verify all environment variables in Vercel
- Check Vercel function logs for errors

### Issue 2: "Payments aren't switched on yet"
**Solution:**
- Verify `NOWPAYMENTS_API_KEY` is set in Vercel
- Verify `NOWPAYMENTS_IPN_SECRET` is set in Vercel
- Check NOWPayments dashboard is active

### Issue 3: "Payment confirmed but no Agent ID"
**Solution:**
- Check Vercel function logs for `/api/telegram/payment-webhook`
- Verify IPN signature is valid
- Check database for session record
- Bot may have failed to send message - message bot again

### Issue 4: "Registration says Agent ID not issued"
**Solution:**
- Make sure payment is confirmed in NOWPayments
- Check database `telegram_onboarding_sessions` table
- Verify `status = 'completed'` and `agent_code` is set
- If everything looks correct, may need to restart Vercel deployment

### Issue 5: Webhook keeps failing
**Solution:**
- Check `TELEGRAM_WEBHOOK_SECRET` matches what you set in webhook URL
- Verify database is accessible (check DATABASE_URL)
- Look at Vercel function logs for specific error messages

---

## 🎉 Success Checklist

- [ ] Created bot with @BotFather
- [ ] Got bot token and username
- [ ] Created NOWPayments account
- [ ] Got API key and IPN secret
- [ ] Added all environment variables to Vercel
- [ ] Redeployed Vercel app
- [ ] Registered Telegram webhook
- [ ] Added IPN callback URL in NOWPayments
- [ ] Tested bot - receives welcome message
- [ ] Tested bot - receives payment QR code
- [ ] (Optional) Tested full payment flow

---

## 📞 Need Help?

### Check Logs
1. **Vercel Logs**: Dashboard → Project → Deployments → Latest → Functions
2. **Telegram Webhook Info**: `https://api.telegram.org/botTOKEN/getWebhookInfo`
3. **Database**: Check `telegram_onboarding_sessions` table

### Common URLs
- Telegram Bot API: https://core.telegram.org/bots/api
- NOWPayments Docs: https://documenter.getpostman.com/view/7907941/
- Vercel Docs: https://vercel.com/docs

### Test Commands
```bash
# Check webhook status
https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo

# Delete webhook (if need to reset)
https://api.telegram.org/botYOUR_TOKEN/deleteWebhook

# Set webhook again
https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_URL

# Get bot info
https://api.telegram.org/botYOUR_TOKEN/getMe
```

---

## 🚀 Going to Production

### When Moving from Sandbox to Production:

1. **Change NOWPayments to Production**
   - Use production API keys (not sandbox)
   - In Vercel, remove `NOWPAYMENTS_SANDBOX` variable
   - Or set it to `false`

2. **Update IPN URL**
   - Make sure it points to production NOWPayments account
   - Same URL, just different account

3. **Test with Small Amount First**
   - Send 200 USDT test payment
   - Verify full flow works
   - Then open to users

4. **Monitor**
   - Check Vercel logs regularly
   - Monitor NOWPayments dashboard
   - Keep backup of all credentials

---

## 🎊 Congratulations!

Your Telegram bot is now live and connected to your application!

Users can now:
1. Message your bot
2. Pay 200 USDT
3. Receive Agent ID automatically
4. Register on your website
5. Start using the partner panel

**Keep your bot token and secrets safe - never share them publicly!**
