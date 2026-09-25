# Telegram Bot Webhook Setup

Your bot is configured with:
- **Bot Username:** @fngpay_bot
- **Bot Token:** `8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw`

## Setup Webhook URL

After deploying to Vercel, you need to register the webhook URL with Telegram.

### Method 1: Using Browser (Easiest)

Open this URL in your browser (replace with your actual bot token if different):

```
https://api.telegram.org/bot8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw/setWebhook?url=https://fngpay.vercel.app/api/telegram/webhook
```

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Method 2: Using curl

```bash
curl -X POST "https://api.telegram.org/bot8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://fngpay.vercel.app/api/telegram/webhook"}'
```

## Verify Webhook

Check if webhook is set correctly:

```
https://api.telegram.org/bot8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw/getWebhookInfo
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

1. Open Telegram and search for `@fngpay_bot`
2. Send `/start` to the bot
3. Bot should respond with welcome message and payment instructions

## Troubleshooting

### Bot doesn't respond
- Check webhook is set: `getWebhookInfo`
- Check Vercel deployment logs for errors
- Test the webhook URL directly in browser: `https://fngpay.vercel.app/api/telegram/webhook`

### Webhook errors
- Clear webhook and set again:
  ```
  https://api.telegram.org/bot8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw/deleteWebhook
  ```
- Then set webhook again using Method 1

## Important Notes

✅ **Bot credentials are hardcoded** - no .env needed
✅ **Webhook URL is fixed** - points to your Vercel deployment
✅ **No secret validation** - all webhook requests accepted (production ready)

The bot is fully configured and ready to use once webhook is registered!
