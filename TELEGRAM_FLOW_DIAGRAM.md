# Telegram Bot Flow - Visual Diagram

## Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────┘

1. USER VISITS WEBSITE
   │
   ├─► User sees Register page
   │   └─► Clicks "Get it now" link
   │
   ├─► Redirects to /api/telegram/start
   │   └─► Redirects to t.me/{bot_username}?start=register
   │
   └─► Telegram app opens

═══════════════════════════════════════════════════════════════════════

2. USER MESSAGES BOT
   │
   ├─► User: "Hi" or any message
   │
   ├─► Telegram sends webhook to:
   │   POST /api/telegram/webhook
   │   {
   │     "message": {
   │       "chat": {"id": 123456789},
   │       "from": {"username": "john_doe"},
   │       "text": "Hi"
   │     }
   │   }
   │
   └─► Bot checks database

═══════════════════════════════════════════════════════════════════════

3. BOT DECISION TREE
   │
   ├─► Check: Active payment exists?
   │   SELECT * FROM telegram_onboarding_sessions
   │   WHERE chat_id = 123456789 AND status = 'active'
   │   │
   │   ├─► YES → Send reminder
   │   │   "Still waiting for your 200 USDT payment..."
   │   │   └─► END
   │   │
   │   └─► NO → Continue
   │
   ├─► Check: Already completed?
   │   SELECT agent_code FROM telegram_onboarding_sessions
   │   WHERE chat_id = 123456789 AND status = 'completed'
   │   │
   │   ├─► YES → Send existing code
   │   │   "You already have an Agent ID: PV-ABC123"
   │   │   └─► END
   │   │
   │   └─► NO → Continue
   │
   └─► First time user → Start onboarding

═══════════════════════════════════════════════════════════════════════

4. CREATE PAYMENT
   │
   ├─► Bot sends welcome message
   │
   ├─► Call NOWPayments API
   │   POST https://api.nowpayments.io/v1/payment
   │   {
   │     "price_amount": 200,
   │     "price_currency": "usdttrc20",
   │     "pay_currency": "usdttrc20",
   │     "order_id": "PV-ONB-123456789-1726990123456",
   │     "ipn_callback_url": "https://your-domain.com/api/telegram/payment-webhook"
   │   }
   │
   ├─► NOWPayments responds
   │   {
   │     "payment_id": "5678901234",
   │     "pay_address": "TXYz...abc123",
   │     "pay_amount": 200.0,
   │     "payment_status": "waiting"
   │   }
   │
   ├─► Save to database
   │   INSERT INTO telegram_onboarding_sessions
   │   (chat_id, payment_id, pay_address, pay_amount, status)
   │   VALUES (123456789, '5678901234', 'TXYz...', 200.0, 'active')
   │
   ├─► Generate QR code
   │   QRCode.toDataURL('TXYz...abc123')
   │
   └─► Send QR to user
       Bot → Telegram → User
       [QR Code Image]
       "Pay 200 USDT to: TXYz...abc123"

═══════════════════════════════════════════════════════════════════════

5. USER PAYS
   │
   ├─► User opens crypto wallet
   ├─► Scans QR or copies address
   ├─► Sends 200 USDT (TRC20)
   │
   └─► Transaction broadcasts to blockchain
       (User waits 1-30 minutes for confirmation)

═══════════════════════════════════════════════════════════════════════

6. BLOCKCHAIN CONFIRMS
   │
   ├─► NOWPayments monitors blockchain
   ├─► Transaction gets confirmations
   │   1 confirmation... 2... 3...
   │
   └─► Status: waiting → confirming → confirmed

═══════════════════════════════════════════════════════════════════════

7. NOWPAYMENTS WEBHOOK (IPN)
   │
   ├─► NOWPayments calls your server:
   │   POST /api/telegram/payment-webhook
   │   Headers:
   │     x-nowpayments-sig: abc123... (HMAC-SHA512)
   │   Body:
   │   {
   │     "payment_id": "5678901234",
   │     "payment_status": "confirmed",
   │     "actually_paid": 200.0
   │   }
   │
   ├─► Server verifies signature
   │   verifyIpnSignature(body, signature)
   │   HMAC-SHA512(sorted JSON body, NOWPAYMENTS_IPN_SECRET)
   │   │
   │   ├─► Invalid → Reject (401)
   │   └─► Valid → Continue
   │
   ├─► Find session in database
   │   SELECT id FROM telegram_onboarding_sessions
   │   WHERE payment_id = '5678901234'
   │
   └─► Process payment
       applyOnboardingPaymentStatus(sessionId, 'confirmed')

═══════════════════════════════════════════════════════════════════════

8. GENERATE AGENT CODE
   │
   ├─► Check: Already credited?
   │   SELECT credited_at FROM telegram_onboarding_sessions
   │   WHERE id = sessionId
   │   │
   │   ├─► credited_at IS NOT NULL
   │   │   └─► Skip (prevents duplicates)
   │   │
   │   └─► credited_at IS NULL
   │       └─► Continue
   │
   ├─► Generate unique code
   │   generateAgentCode(client)
   │   │
   │   ├─► Loop (max 20 attempts):
   │   │   - Generate random: PV-{6 chars}
   │   │   - Chars from: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
   │   │   - Check uniqueness in agents + telegram_onboarding_sessions
   │   │   - If unique → Use it
   │   │   - Else → Try again
   │   │
   │   └─► Result: "PV-X7H9K2"
   │
   ├─► Update database (in transaction)
   │   BEGIN;
   │   UPDATE telegram_onboarding_sessions
   │   SET agent_code = 'PV-X7H9K2',
   │       credited_at = NOW(),
   │       status = 'completed'
   │   WHERE id = sessionId;
   │   COMMIT;
   │
   └─► Send notification
       sendTelegramMessage(chatId, "✅ Payment confirmed!\n\nYour Agent ID is: PV-X7H9K2...")

═══════════════════════════════════════════════════════════════════════

9. USER RECEIVES AGENT ID
   │
   ├─► Telegram notification arrives
   │   "✅ Payment confirmed!
   │    Your Agent ID is: PV-X7H9K2"
   │
   ├─► User copies Agent ID
   │
   └─► User goes back to website

═══════════════════════════════════════════════════════════════════════

10. WEBSITE REGISTRATION
    │
    ├─► User fills form:
    │   - Full Name: "John Doe"
    │   - Agent ID: "PV-X7H9K2"  ← From Telegram
    │   - Email: "john@example.com"
    │   - Mobile: "+91 1234567890"
    │   - Telegram: "@john_doe"
    │   - Password: "********"
    │   - PIN: "1234"
    │
    ├─► Submit → POST /api/auth/register
    │
    ├─► Validate Agent ID
    │   BEGIN;
    │   
    │   SELECT id FROM telegram_onboarding_sessions
    │   WHERE agent_code = 'PV-X7H9K2'
    │     AND status = 'completed'
    │     AND claimed_at IS NULL
    │   FOR UPDATE;
    │   │
    │   ├─► Not found → Error: "Agent ID hasn't been issued yet"
    │   ├─► Already claimed → Error: "Agent ID already exists"
    │   └─► Valid → Continue
    │
    ├─► Mark as claimed
    │   UPDATE telegram_onboarding_sessions
    │   SET claimed_at = NOW()
    │   WHERE agent_code = 'PV-X7H9K2';
    │
    ├─► Create agent account
    │   provisionNewAgent(client, {
    │     agentCode: 'PV-X7H9K2',
    │     fullName: 'John Doe',
    │     email: 'john@example.com',
    │     passwordHash: '$2b$10$...',
    │     pinHash: '$2b$10$...'
    │   })
    │   │
    │   ├─► INSERT INTO agents (...)
    │   ├─► INSERT INTO wallets (agent_id, balance_usdt = 0)
    │   ├─► INSERT INTO notification_preferences (...)
    │   └─► INSERT INTO referral_stats (...)
    │
    ├─► Create session
    │   createSession(agentId)
    │
    ├─► COMMIT;
    │
    └─► Redirect to authenticator setup

═══════════════════════════════════════════════════════════════════════

11. COMPLETE!
    │
    ├─► User sets up authenticator (2FA)
    ├─► Completes security deposit (2,000 USDT)
    ├─► Adds bank accounts / UPI
    └─► Panel is active → Can receive orders

═══════════════════════════════════════════════════════════════════════


┌─────────────────────────────────────────────────────────────────────┐
│                     DATABASE STATE TRACKING                          │
└─────────────────────────────────────────────────────────────────────┘

telegram_onboarding_sessions timeline:

INITIAL (User messages bot)
┌────────────────────────────────────────┐
│ chat_id:         123456789             │
│ payment_id:      5678901234            │
│ pay_address:     TXYz...abc123         │
│ status:          'active'              │
│ agent_code:      NULL                  │
│ credited_at:     NULL                  │
│ claimed_at:      NULL                  │
└────────────────────────────────────────┘
             ↓
       (User pays)
             ↓
    (Webhook arrives)
             ↓

CREDITED (Payment confirmed)
┌────────────────────────────────────────┐
│ chat_id:         123456789             │
│ payment_id:      5678901234            │
│ pay_address:     TXYz...abc123         │
│ status:          'completed'           │
│ agent_code:      'PV-X7H9K2'    ← Generated
│ credited_at:     2026-09-22 10:30 ← Set
│ claimed_at:      NULL                  │
└────────────────────────────────────────┘
             ↓
   (User registers)
             ↓

CLAIMED (Registration complete)
┌────────────────────────────────────────┐
│ chat_id:         123456789             │
│ payment_id:      5678901234            │
│ pay_address:     TXYz...abc123         │
│ status:          'completed'           │
│ agent_code:      'PV-X7H9K2'           │
│ credited_at:     2026-09-22 10:30      │
│ claimed_at:      2026-09-22 10:45 ← Set
└────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     SECURITY MECHANISMS                              │
└─────────────────────────────────────────────────────────────────────┘

1. Telegram Webhook Security
   ├─► x-telegram-bot-api-secret-token header
   └─► Must match TELEGRAM_WEBHOOK_SECRET

2. NOWPayments IPN Security
   ├─► x-nowpayments-sig header
   ├─► HMAC-SHA512(sorted JSON, NOWPAYMENTS_IPN_SECRET)
   └─► Prevents spoofed payments

3. Agent Code Uniqueness
   ├─► 6 random chars (no 0/O/1/I/L)
   ├─► Checked against agents + telegram_onboarding_sessions
   └─► 20 generation attempts

4. Idempotent Payment Processing
   ├─► credited_at check → Skip if already set
   ├─► claimed_at check → Prevent reuse
   └─► Safe to replay webhooks

5. Database Transactions
   ├─► BEGIN; ... COMMIT; for all critical operations
   ├─► FOR UPDATE locks on concurrent operations
   └─► Rollback on errors


┌─────────────────────────────────────────────────────────────────────┐
│                     ERROR RECOVERY                                   │
└─────────────────────────────────────────────────────────────────────┘

Scenario 1: User lost Agent ID
├─► Message bot again
├─► Bot finds completed session by chat_id
└─► Resends existing agent_code

Scenario 2: Webhook failed/missed
├─► Payment confirmed but no agent code
├─► Manual: Call applyOnboardingPaymentStatus()
├─► credited_at prevents duplicates
└─► User receives Telegram notification

Scenario 3: User paid wrong amount
├─► Status: partially_paid
├─► status = 'active' (not completed)
├─► User messages bot → Reminder to complete
└─► Manual intervention needed

Scenario 4: Telegram notification failed
├─► Agent code saved in database
├─► User messages bot again
├─► Bot finds completed session
└─► Resends agent_code

Scenario 5: User never registered
├─► Agent code valid forever
├─► claimed_at = NULL
├─► Can register anytime
└─► Code tied to chat_id for recovery
```

## Quick Reference

### Files Involved
```
app/api/telegram/webhook/route.ts          - Main bot logic
app/api/telegram/payment-webhook/route.ts  - Payment confirmations
app/api/auth/register/route.ts            - Registration validation
lib/telegram-onboarding.ts                - Agent code generation
lib/nowpayments.ts                        - Payment processing
```

### Key Database Checks
```sql
-- Active payment check
SELECT id FROM telegram_onboarding_sessions 
WHERE chat_id = ? AND status = 'active';

-- Existing agent code check
SELECT agent_code FROM telegram_onboarding_sessions 
WHERE chat_id = ? AND status = 'completed';

-- Registration validation
SELECT id FROM telegram_onboarding_sessions 
WHERE agent_code = ? 
  AND status = 'completed' 
  AND claimed_at IS NULL;
```

### Environment Setup Order
1. Create bot with @BotFather → Get token
2. Sign up NOWPayments → Get API key + IPN secret
3. Deploy app → Get public URL
4. Register Telegram webhook → Set URL + secret
5. Configure NOWPayments IPN → Set callback URL
6. Test with sandbox mode first
7. Switch to production
