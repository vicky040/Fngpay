-- Runs once, automatically, the first time the postgres container's data
-- volume is created (official postgres image behavior for
-- /docker-entrypoint-initdb.d — files run in filename order). Delete the
-- postgres_data volume (docker compose down -v) to re-run from scratch.

CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  agent_code TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  mobile TEXT,
  telegram_id TEXT,
  -- Nullable: accounts created via "Continue with Google" have no password
  -- of their own to hash.
  password_hash TEXT,
  pin_hash TEXT,
  -- Set for accounts created (or linked) via Google Sign-In; NULL for
  -- accounts registered with the Agent ID + password form.
  google_id TEXT UNIQUE,
  avatar_url TEXT,
  -- RFC 6238 TOTP — the real "code from your authenticator app" secret.
  -- NULL until the agent completes setup; two_factor_enabled only ever
  -- flips to TRUE once totp_confirmed_at is set (see /api/auth/totp/confirm).
  totp_secret TEXT,
  totp_confirmed_at TIMESTAMPTZ,
  security_deposit_completed BOOLEAN NOT NULL DEFAULT FALSE,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessions_agent_id_idx ON sessions(agent_id);

CREATE TABLE wallets (
  agent_id INTEGER PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
  balance_usdt NUMERIC(18, 2) NOT NULL DEFAULT 0,
  fixed_rate_inr NUMERIC(10, 2) NOT NULL DEFAULT 110,
  today_payin_inr NUMERIC(18, 2) NOT NULL DEFAULT 0,
  today_payout_inr NUMERIC(18, 2) NOT NULL DEFAULT 0,
  today_earning_inr NUMERIC(18, 2) NOT NULL DEFAULT 0
);

CREATE TABLE wallet_entries (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  entry_type TEXT NOT NULL,
  sub TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  amount TEXT NOT NULL,
  balance TEXT NOT NULL
);
CREATE INDEX wallet_entries_agent_id_idx ON wallet_entries(agent_id);

CREATE TABLE payin_orders (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payout_orders (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reference data: the bank picker list on the Select-bank screen. Not
-- agent-scoped — every agent picks from the same catalog.
CREATE TABLE bank_reference (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short_code TEXT NOT NULL,
  mark TEXT NOT NULL
);

-- Settlement banks an agent has actually linked via Select bank -> Add bank.
CREATE TABLE linked_banks (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_short TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX linked_banks_agent_id_idx ON linked_banks(agent_id);

-- Reference data: business UPI providers, shown locked until deposit is done.
CREATE TABLE upi_providers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mark TEXT NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL
);

CREATE TABLE utr_records (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  utr TEXT NOT NULL,
  bank TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX utr_records_agent_id_idx ON utr_records(agent_id);

-- Reference data: the fixed commission-rate cards on the Commission screen.
CREATE TABLE commission_rates (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  note TEXT NOT NULL,
  sort_order INT NOT NULL
);

CREATE TABLE commission_reports (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  period_type TEXT NOT NULL,
  period_label TEXT NOT NULL,
  deposits TEXT NOT NULL,
  withdrawals TEXT NOT NULL,
  commission TEXT NOT NULL,
  net TEXT NOT NULL,
  sort_order INT NOT NULL
);
CREATE INDEX commission_reports_agent_period_idx ON commission_reports(agent_id, period_type);

CREATE TABLE commission_metrics (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  sort_order INT NOT NULL
);
CREATE INDEX commission_metrics_agent_id_idx ON commission_metrics(agent_id);

CREATE TABLE commission_weekly (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  payin_pct INT NOT NULL,
  payout_pct INT NOT NULL,
  agent_pct INT NOT NULL,
  sort_order INT NOT NULL
);
CREATE INDEX commission_weekly_agent_id_idx ON commission_weekly(agent_id);

-- Reference data: FAQ list on the Help screen.
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL
);

CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX support_tickets_agent_id_idx ON support_tickets(agent_id);

CREATE TABLE referral_stats (
  agent_id INTEGER PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  successful_referrals INT NOT NULL DEFAULT 0,
  agentship_requirement INT NOT NULL DEFAULT 3,
  agentship_unlocked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE notification_preferences (
  agent_id INTEGER PRIMARY KEY REFERENCES agents(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  telegram_notifications BOOLEAN NOT NULL DEFAULT TRUE
);

-- One row per NOWPayments payment created from the Add Funds screen.
-- provider_status holds NOWPayments' own enum verbatim (waiting, confirming,
-- confirmed, sending, partially_paid, finished, failed, refunded, expired);
-- status is our own simplified view (active/completed/failed) the UI reads.
-- credited_at is set exactly once, by the IPN handler, the moment the wallet
-- balance is actually incremented — its presence is what makes a webhook
-- that fires twice for the same payment safe to replay.
CREATE TABLE deposit_sessions (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'nowpayments',
  payment_id TEXT UNIQUE,
  order_id TEXT,
  pay_currency TEXT NOT NULL DEFAULT 'usdttrc20',
  pay_address TEXT,
  pay_amount NUMERIC(18, 8),
  price_amount NUMERIC(18, 2) NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'inr',
  provider_status TEXT NOT NULL DEFAULT 'waiting',
  status TEXT NOT NULL DEFAULT 'active',
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX deposit_sessions_agent_id_idx ON deposit_sessions(agent_id);

-- Telegram-bot partner onboarding: a person messages the bot before they
-- have an account, pays the one-time 200 USDT onboarding fee via
-- NOWPayments (same provider/pattern as deposit_sessions), and only once
-- that's confirmed do we mint an agent_code and message it back to them.
-- claimed_at is set by /api/auth/register the moment that code is actually
-- used to create an account, so a confirmed-but-unused code can't be reused
-- by someone else who saw it, and a used one can't be replayed.
CREATE TABLE telegram_onboarding_sessions (
  id SERIAL PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  telegram_username TEXT,
  agent_code TEXT UNIQUE,
  provider TEXT NOT NULL DEFAULT 'nowpayments',
  payment_id TEXT UNIQUE,
  order_id TEXT,
  pay_currency TEXT NOT NULL DEFAULT 'usdttrc20',
  pay_address TEXT,
  pay_amount NUMERIC(18, 8),
  price_amount NUMERIC(18, 2) NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'usdttrc20',
  provider_status TEXT NOT NULL DEFAULT 'waiting',
  status TEXT NOT NULL DEFAULT 'active',
  credited_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX telegram_onboarding_sessions_chat_id_idx ON telegram_onboarding_sessions(chat_id);
