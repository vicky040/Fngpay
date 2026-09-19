-- Demo data so the app has something to show immediately after first boot.
-- Demo login: agent code PV-G9KL27 (or arjunkumawat062@gmail.com), password
-- Payvora@123 — see the bcrypt hash below, generated with bcryptjs at hash
-- cost 10, matching what lib/auth.ts uses at runtime.

INSERT INTO agents (agent_code, full_name, email, mobile, telegram_id, password_hash, security_deposit_completed, two_factor_enabled)
VALUES (
  'PV-G9KL27',
  'Anurag kumawat',
  'arjunkumawat062@gmail.com',
  '8562062626',
  '@Boss7224',
  '$2b$10$If50dmOR6.EONukOPrIVf.81PosY1SnUw90JUa2FuZB/ciFNs/rBe',
  TRUE,
  TRUE
);

INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr, today_payin_inr, today_payout_inr, today_earning_inr)
VALUES (1, 2200.00, 110.00, 0, 0, 0);

INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance) VALUES
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 3681d9f68f87…', '2026-09-05 13:08:00+00', '+2,000 USDT', 'Bal 2,200 USDT'),
  (1, 'ADJUSTMENT', 'Adjustments', 'verifaction fund (delta: +200)', '2026-09-05 11:41:00+00', '+200 USDT', 'Bal 200 USDT');

INSERT INTO bank_reference (name, short_code, mark) VALUES
  ('Abhyudaya Co-operative Bank', 'Abhyudaya', 'AB'),
  ('Ahmedabad Mercantile Co-operative Bank', 'AMCB', 'AM'),
  ('Airtel Payments Bank', 'Airtel PB', 'AP'),
  ('Andhra Pradesh Grameena Vikas Bank', 'APGVB', 'AG'),
  ('Andhra Pradesh State Co-operative Bank', 'APCOB', 'AC'),
  ('Andhra Pragathi Grameena Bank', 'APGB', 'AR'),
  ('Apna Sahakari Bank', 'Apna', 'AS'),
  ('Arunachal Pradesh Rural Bank', 'APRB', 'AN'),
  ('Assam Gramin Vikash Bank', 'AGVB', 'AV'),
  ('AU Small Finance Bank', 'AU SFB', 'AU'),
  ('Axis Bank', 'Axis', 'AX'),
  ('Bandhan Bank', 'Bandhan', 'BN'),
  ('Bank of Baroda', 'BoB', 'BB'),
  ('Bank of India', 'BoI', 'BI'),
  ('Bank of Maharashtra', 'BoM', 'BM'),
  ('Baroda Gujarat Gramin Bank', 'BGGB', 'BG'),
  ('Baroda Rajasthan Kshetriya Gramin Bank', 'BRKGB', 'BR'),
  ('Canara Bank', 'Canara', 'CA'),
  ('Central Bank of India', 'CBI', 'CB'),
  ('City Union Bank', 'CUB', 'CU'),
  ('DBS Bank India', 'DBS', 'DB'),
  ('DCB Bank', 'DCB', 'DC'),
  ('Federal Bank', 'Federal', 'FB'),
  ('HDFC Bank', 'HDFC', 'HD'),
  ('ICICI Bank', 'ICICI', 'IC'),
  ('IDBI Bank', 'IDBI', 'ID'),
  ('IDFC FIRST Bank', 'IDFC', 'IF'),
  ('Indian Bank', 'Indian', 'IN'),
  ('Indian Overseas Bank', 'IOB', 'IO'),
  ('IndusInd Bank', 'IndusInd', 'IU'),
  ('Jammu & Kashmir Bank', 'J&K', 'JK'),
  ('Karnataka Bank', 'KBL', 'KB'),
  ('Karur Vysya Bank', 'KVB', 'KV'),
  ('Kotak Mahindra Bank', 'Kotak', 'KM'),
  ('Punjab & Sind Bank', 'P&S', 'PS'),
  ('Punjab National Bank', 'PNB', 'PN'),
  ('RBL Bank', 'RBL', 'RB'),
  ('South Indian Bank', 'SIB', 'SI'),
  ('State Bank of India', 'SBI', 'SB'),
  ('Tamilnad Mercantile Bank', 'TMB', 'TM'),
  ('UCO Bank', 'UCO', 'UC'),
  ('Union Bank of India', 'Union', 'UB'),
  ('Yes Bank', 'Yes', 'YB');

INSERT INTO upi_providers (name, mark, locked, sort_order) VALUES
  ('Airtel UPI', 'AU', TRUE, 1),
  ('PhonePe Business', 'PP', TRUE, 2),
  ('Paytm Business', 'PT', TRUE, 3),
  ('BharatPe Business', 'BP', TRUE, 4),
  ('Google Pay Business', 'GP', TRUE, 5),
  ('IndusPay', 'IP', TRUE, 6),
  ('Freecharge', 'FC', TRUE, 7),
  ('POP UPI', 'PO', TRUE, 8),
  ('BHIM UPI', 'BH', TRUE, 9),
  ('Kotak UPI', 'KO', TRUE, 10);

INSERT INTO utr_records (agent_id, utr, bank, amount, status, occurred_at) VALUES
  (1, 'AXIS2508201844551', 'Axis Bank', '₹15,000.00', 'Matched', '2026-08-20 00:00:00+00'),
  (1, 'SBIN2508199922110', 'State Bank of India', '₹22,000.00', 'Pending', '2026-08-19 00:00:00+00'),
  (1, 'HDFC2508187712345', 'HDFC Bank', '₹9,500.00', 'Unmatched', '2026-08-18 00:00:00+00'),
  (1, 'ICIC2508175544332', 'ICICI Bank', '₹31,000.00', 'Matched', '2026-08-17 00:00:00+00');

INSERT INTO commission_rates (label, value, note, sort_order) VALUES
  ('Payin', '5.5%', 'Payment processing commission.', 1),
  ('Payout', '1.5%', 'Withdrawal processing commission.', 2),
  ('Agent commission', '1% EXTRA', 'Additional agent commission based on eligible agent turnover.', 3);

INSERT INTO commission_reports (agent_id, period_type, period_label, deposits, withdrawals, commission, net, sort_order) VALUES
  (1, 'Daily', '2026-08-20', '₹1,25,000.00', '₹48,000.00', '₹8,125.00', '₹77,000.00', 1),
  (1, 'Daily', '2026-08-19', '₹98,000.00', '₹52,000.00', '₹6,170.00', '₹46,000.00', 2),
  (1, 'Daily', '2026-08-18', '₹1,42,000.00', '₹61,000.00', '₹8,725.00', '₹81,000.00', 3),
  (1, 'Weekly', '2026-W34', '₹7,65,000.00', '₹3,12,000.00', '₹46,780.00', '₹4,53,000.00', 1),
  (1, 'Weekly', '2026-W33', '₹6,90,000.00', '₹2,84,000.00', '₹42,210.00', '₹4,06,000.00', 2),
  (1, 'Monthly', '2026-08', '₹28,40,000.00', '₹11,90,000.00', '₹1,74,050.00', '₹16,50,000.00', 1),
  (1, 'Monthly', '2026-07', '₹24,10,000.00', '₹10,20,000.00', '₹1,47,850.00', '₹13,90,000.00', 2);

INSERT INTO commission_metrics (agent_id, label, value, sort_order) VALUES
  (1, 'Payin Volume', '₹12,50,000.00', 1),
  (1, 'Payout Volume', '₹4,80,000.00', 2),
  (1, 'Payin Commission (5.5%)', '₹68,750.00', 3),
  (1, 'Payout Commission (1.5%)', '₹7,200.00', 4),
  (1, 'Agent Commission (1% EXTRA)', '₹12,500.00', 5),
  (1, 'Total Commission', '₹88,450.00', 6);

INSERT INTO commission_weekly (agent_id, day, payin_pct, payout_pct, agent_pct, sort_order) VALUES
  (1, 'Mon', 70, 26, 12, 1),
  (1, 'Tue', 88, 30, 15, 2),
  (1, 'Wed', 62, 38, 10, 3),
  (1, 'Thu', 100, 28, 18, 4),
  (1, 'Fri', 80, 52, 6, 5);

INSERT INTO faqs (question, answer, sort_order) VALUES
  ('What is FNGPAY?', 'FNGPAY is a B2B payment-processing platform that provides a centralized panel for P2P traders and operators to manage deposits, withdrawals, transactions, and related operational workflows.', 1),
  ('Who can apply?', 'P2P traders and operators who complete official Telegram onboarding and hold a FNGPAY-issued Agent ID.', 2),
  ('What does the panel provide?', 'Payin and payout orders, wallet history, settlement banks and UPI apps, UTR matching, reports, and commission tracking in one place.', 3),
  ('What are the processing commissions?', 'Payin 5.5%, payout 1.5%, and 1% EXTRA agent commission on eligible agent turnover. Rates are never combined into a single percentage.', 4),
  ('What is Referral Commission and Agentship?', 'Referral Commission is 0.3% of the daily turnover of traders you refer. Agentship Commission is 1% of the daily turnover generated by traders under your referral network, once your Agentship application is approved.', 5),
  ('How does onboarding work?', 'Onboarding runs through official FNGPAY Telegram channels. You receive an Agent ID, register on the panel, and set up your authenticator.', 6),
  ('Why do you require 200 USDT before issuing an Agent ID?', 'The amount is recorded against your account during onboarding and is reflected in your wallet history as a verification entry.', 7),
  ('Is there a setup fee?', 'Panel access is tied to the security deposit and account configuration under your agreement. Contact support for the terms applicable to your account.', 8),
  ('How do I access my panel?', 'Log in with your Agent ID or registered email, your login password, and the 6-digit code from your authenticator app.', 9),
  ('How can I contact support?', 'Message @Payvoraofficial on Telegram, or use the FNGPAY Telegram bot @payvorap2p_bot for instant answers.', 10);

INSERT INTO referral_stats (agent_id, referral_code, successful_referrals, agentship_requirement, agentship_unlocked)
VALUES (1, 'PV-ARIJA0DAAA', 0, 3, FALSE);

INSERT INTO notification_preferences (agent_id, email_notifications, telegram_notifications)
VALUES (1, TRUE, TRUE);
