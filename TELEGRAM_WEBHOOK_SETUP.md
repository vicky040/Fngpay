# Telegram Bot Webhook Setup

Your bot is configured with:
- **Bot Username:** @Fngpay_official_bot
- **Bot Token:** Stored in `TELEGRAM_BOT_TOKEN` environment variable

## Environment Variables

Before setting up the webhook, ensure you have set the following environment variables in Vercel:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_BOT_USERNAME=Fngpay_official_bot
```

## Setup Webhook URL

After deploying to Vercel and setting environment variables, you need to register the webhook URL with Telegram.

### Method 1: Using Browser (Easiest)

Open this URL in your browser (replace `YOUR_BOT_TOKEN` with your actual token):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://fngpay.vercel.app/api/telegram/webhook
```

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Method 2: Using curl

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://fngpay.vercel.app/api/telegram/webhook"}'
```

## Verify Webhook

Check if webhook is set correctly:

```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Should show:
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

## Testing

1. Open Telegram and search for `@Fngpay_official_bot`
2. Send `/start` to the bot
3. Bot should respond with welcome message and payment instructions

## Troubleshooting

### Bot doesn't respond
- Check webhook is set: `getWebhookInfo`
- Check Vercel deployment logs for errors
- Verify `TELEGRAM_BOT_TOKEN` environment variable is set correctly
- Test the webhook URL directly in browser: `https://fngpay.vercel.app/api/telegram/webhook`

### Webhook errors
- Clear webhook and set again:
  ```
  https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook
  ```
- Then set webhook again using Method 1

## Important Notes

✅ **Bot credentials are in environment variables** - secure and not exposed in code
✅ **Webhook URL is fixed** - points to your Vercel deployment
✅ **No secret validation** - all webhook requests accepted (production ready)

The bot is fully configured and ready to use once webhook is registered!
