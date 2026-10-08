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
VALUES (1, 7086.00, 104.00, 0, 0, 0);

INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance) VALUES
  -- Initial deposits (Sept 5)
  (1, 'ADJUSTMENT', 'Adjustments', 'verifaction fund (delta: +200)', '2026-09-05 11:41:00+00', '+200 USDT', 'Bal 200 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 3681d9f68f87…', '2026-09-05 13:08:00+00', '+2,000 USDT', 'Bal 2,200 USDT'),

  -- Sept 6-7: Active trading
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 4f92a3b12c56…', '2026-09-06 09:15:00+00', '+500 USDT', 'Bal 2,700 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · HDFC ****8521 · TXN48592', '2026-09-06 14:30:00+00', '-300 USDT', 'Bal 2,400 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payin commission · 6% on ₹52,000', '2026-09-06 16:45:00+00', '+30 USDT', 'Bal 2,430 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 7a34c9d21f89…', '2026-09-07 10:20:00+00', '+800 USDT', 'Bal 3,230 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · ICICI ****2890 · TXN48601', '2026-09-07 15:50:00+00', '-450 USDT', 'Bal 2,780 USDT'),

  -- Sept 8-10: Weekend activity
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 2b56f8e43a12…', '2026-09-08 11:30:00+00', '+600 USDT', 'Bal 3,380 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payout commission · 2% on ₹31,200', '2026-09-08 17:00:00+00', '+12 USDT', 'Bal 3,392 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · SBI ****7654 · TXN48615', '2026-09-09 12:15:00+00', '-550 USDT', 'Bal 2,842 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 9c21e5a67b34…', '2026-09-10 14:45:00+00', '+750 USDT', 'Bal 3,592 USDT'),

  -- Sept 11-15: High volume week
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 3d89f1b24c67…', '2026-09-11 09:00:00+00', '+1,000 USDT', 'Bal 4,592 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · Kotak ****3421 · TXN48628', '2026-09-11 16:20:00+00', '-600 USDT', 'Bal 3,992 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payin commission · 6% on ₹1,04,000', '2026-09-12 10:30:00+00', '+60 USDT', 'Bal 4,052 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 6e45a9c32f18…', '2026-09-12 13:40:00+00', '+850 USDT', 'Bal 4,902 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · HDFC ****8521 · TXN48642', '2026-09-13 11:25:00+00', '-700 USDT', 'Bal 4,202 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 1a78b4e93d56…', '2026-09-14 15:10:00+00', '+950 USDT', 'Bal 5,152 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · Axis ****5678 · TXN48659', '2026-09-15 09:50:00+00', '-800 USDT', 'Bal 4,352 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payout commission · 2% on ₹62,400', '2026-09-15 18:00:00+00', '+24 USDT', 'Bal 4,376 USDT'),

  -- Sept 16-20: Moderate activity
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 8f23c1a56d89…', '2026-09-16 10:15:00+00', '+650 USDT', 'Bal 5,026 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · ICICI ****2890 · TXN48673', '2026-09-17 14:30:00+00', '-500 USDT', 'Bal 4,526 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 4c67e2b91f34…', '2026-09-18 11:20:00+00', '+720 USDT', 'Bal 5,246 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payin commission · 6% on ₹74,880', '2026-09-19 16:45:00+00', '+43.20 USDT', 'Bal 5,289.20 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · SBI ****7654 · TXN48691', '2026-09-20 12:00:00+00', '-650 USDT', 'Bal 4,639.20 USDT'),

  -- Sept 21-25: Peak week
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 2e91f6a43c78…', '2026-09-21 09:30:00+00', '+1,100 USDT', 'Bal 5,739.20 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · Kotak ****3421 · TXN48705', '2026-09-22 15:15:00+00', '-750 USDT', 'Bal 4,989.20 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 9b34d7e52a19…', '2026-09-23 10:45:00+00', '+880 USDT', 'Bal 5,869.20 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payout commission · 2% on ₹78,000', '2026-09-23 17:30:00+00', '+30 USDT', 'Bal 5,899.20 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · HDFC ****8521 · TXN48722', '2026-09-24 11:40:00+00', '-680 USDT', 'Bal 5,219.20 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 5f67a3c89d21…', '2026-09-25 14:20:00+00', '+920 USDT', 'Bal 6,139.20 USDT'),

  -- Sept 26-30: Month end
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · Axis ****5678 · TXN48736', '2026-09-26 10:30:00+00', '-700 USDT', 'Bal 5,439.20 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payin commission · 6% on ₹95,680', '2026-09-27 16:00:00+00', '+55.20 USDT', 'Bal 5,494.40 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 7a12e8b45c93…', '2026-09-28 12:15:00+00', '+780 USDT', 'Bal 6,274.40 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · ICICI ****2890 · TXN48751', '2026-09-29 15:45:00+00', '-620 USDT', 'Bal 5,654.40 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 3c89f1d62a45…', '2026-09-30 09:50:00+00', '+840 USDT', 'Bal 6,494.40 USDT'),

  -- Oct 1-8: New month activity
  (1, 'ADJUSTMENT', 'Commission', 'Payout commission · 2% on ₹64,480', '2026-10-01 10:30:00+00', '+24.80 USDT', 'Bal 6,519.20 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 8d23a4f71c56…', '2026-10-02 11:20:00+00', '+950 USDT', 'Bal 7,469.20 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · SBI ****7654 · TXN48769', '2026-10-03 14:40:00+00', '-720 USDT', 'Bal 6,749.20 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 1f56b9e34a82…', '2026-10-04 09:15:00+00', '+680 USDT', 'Bal 7,429.20 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payin commission · 6% on ₹70,720', '2026-10-05 15:30:00+00', '+40.80 USDT', 'Bal 7,470 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · Kotak ****3421 · TXN48784', '2026-10-06 12:25:00+00', '-580 USDT', 'Bal 6,890 USDT'),
  (1, 'DEPOSIT', 'Deposits', 'Auto USDT TRC20 · 6a91c2e78f34…', '2026-10-07 10:50:00+00', '+820 USDT', 'Bal 7,710 USDT'),
  (1, 'WITHDRAWAL', 'Withdrawals', 'Admin Payout · HDFC ****8521 · TXN48798', '2026-10-08 13:15:00+00', '-650 USDT', 'Bal 7,060 USDT'),
  (1, 'ADJUSTMENT', 'Commission', 'Payout commission · 2% on ₹67,600', '2026-10-08 17:45:00+00', '+26 USDT', 'Bal 7,086 USDT');

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
  ('Payin', '6%', 'Payment processing commission.', 1),
  ('Payout', '2%', 'Withdrawal processing commission.', 2),
  ('Agent commission', '1% EXTRA', 'Additional agent commission based on eligible agent turnover.', 3);

INSERT INTO commission_reports (agent_id, period_type, period_label, deposits, withdrawals, commission, net, sort_order) VALUES
  -- October 2026 (recent days)
  (1, 'Daily', '2026-10-08', '₹85,280.00', '₹67,600.00', '₹6,469.60', '₹17,680.00', 1),
  (1, 'Daily', '2026-10-07', '₹85,280.00', '₹60,320.00', '₹6,324.80', '₹24,960.00', 2),
  (1, 'Daily', '2026-10-06', '₹70,720.00', '₹60,320.00', '₹5,449.60', '₹10,400.00', 3),
  (1, 'Daily', '2026-10-05', '₹70,720.00', '₹74,880.00', '₹5,741.60', '-₹4,160.00', 4),
  (1, 'Daily', '2026-10-04', '₹70,720.00', '₹0.00', '₹4,243.20', '₹70,720.00', 5),
  -- September 2026 (sample recent days)
  (1, 'Daily', '2026-09-30', '₹87,360.00', '₹64,480.00', '₹6,531.20', '₹22,880.00', 6),
  (1, 'Daily', '2026-09-29', '₹81,120.00', '₹64,480.00', '₹6,156.80', '₹16,640.00', 7),
  (1, 'Daily', '2026-09-28', '₹81,120.00', '₹72,800.00', '₹6,323.20', '₹8,320.00', 8),
  -- Weekly reports
  (1, 'Weekly', '2026-W41', '₹4,12,000.00', '₹3,24,000.00', '₹31,200.00', '₹88,000.00', 1),
  (1, 'Weekly', '2026-W40', '₹5,85,000.00', '₹4,16,000.00', '₹43,420.00', '₹1,69,000.00', 2),
  (1, 'Weekly', '2026-W39', '₹5,42,000.00', '₹3,89,000.00', '₹40,300.00', '₹1,53,000.00', 3),
  (1, 'Weekly', '2026-W38', '₹6,18,000.00', '₹4,42,000.00', '₹45,920.00', '₹1,76,000.00', 4),
  (1, 'Weekly', '2026-W37', '₹4,95,000.00', '₹3,58,000.00', '₹36,860.00', '₹1,37,000.00', 5),
  (1, 'Weekly', '2026-W36', '₹5,72,000.00', '₹3,96,000.00', '₹42,240.00', '₹1,76,000.00', 6),
  (1, 'Weekly', '2026-W34', '₹7,65,000.00', '₹3,12,000.00', '₹46,780.00', '₹4,53,000.00', 7),
  (1, 'Weekly', '2026-W33', '₹6,90,000.00', '₹2,84,000.00', '₹42,210.00', '₹4,06,000.00', 8),
  -- Monthly reports
  (1, 'Monthly', '2026-10', '₹4,12,000.00', '₹2,63,120.00', '₹30,005.60', '₹1,48,880.00', 1),
  (1, 'Monthly', '2026-09', '₹33,24,000.00', '₹20,01,000.00', '₹2,39,460.00', '₹13,23,000.00', 2),
  (1, 'Monthly', '2026-08', '₹28,40,000.00', '₹11,90,000.00', '₹1,74,050.00', '₹16,50,000.00', 3),
  (1, 'Monthly', '2026-07', '₹24,10,000.00', '₹10,20,000.00', '₹1,47,850.00', '₹13,90,000.00', 4);

INSERT INTO commission_metrics (agent_id, label, value, sort_order) VALUES
  (1, 'Payin Volume', '₹65,86,000.00', 1),
  (1, 'Payout Volume', '₹34,54,120.00', 2),
  (1, 'Payin Commission (6%)', '₹3,95,160.00', 3),
  (1, 'Payout Commission (2%)', '₹69,082.40', 4),
  (1, 'Agent Commission (1% EXTRA)', '₹1,00,401.20', 5),
  (1, 'Total Commission', '₹5,64,643.60', 6);

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
  ('What are the processing commissions?', 'Payin 6%, payout 2%, and 1% EXTRA agent commission on eligible agent turnover. Rates are never combined into a single percentage.', 4),
  ('What is Referral Commission and Agentship?', 'Referral Commission is 0.3% of the daily turnover of traders you refer. Agentship Commission is 1% of the daily turnover generated by traders under your referral network, once your Agentship application is approved.', 5),
  ('How does onboarding work?', 'Onboarding runs through official FNGPAY Telegram channels. You receive an Agent ID, register on the panel, and set up your authenticator.', 6),
  ('Why do you require 200 USDT before issuing an Agent ID?', 'The amount is recorded against your account during onboarding and is reflected in your wallet history as a verification entry.', 7),
  ('Is there a setup fee?', 'Panel access is tied to the security deposit and account configuration under your agreement. Contact support for the terms applicable to your account.', 8),
  ('How do I access my panel?', 'Log in with your Agent ID or registered email, your login password, and the 6-digit code from your authenticator app.', 9),
  ('How can I contact support?', 'Visit our website at fngpay.com, join our Telegram group at t.me/+RpX8P-Z2eJ40MzQ1, or message @fngpay_bot on Telegram for instant support.', 10);

INSERT INTO referral_stats (agent_id, referral_code, successful_referrals, agentship_requirement, agentship_unlocked)
VALUES (1, 'PV-ARIJA0DAAA', 0, 3, FALSE);

INSERT INTO notification_preferences (agent_id, email_notifications, telegram_notifications)
VALUES (1, TRUE, TRUE);
