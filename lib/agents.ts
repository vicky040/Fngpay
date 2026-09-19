import type { PoolClient } from "pg";

export type NewAgentInput = {
  agentCode: string;
  fullName: string;
  email: string;
  mobile?: string | null;
  telegramId?: string | null;
  passwordHash?: string | null;
  pinHash?: string | null;
  googleId?: string | null;
  avatarUrl?: string | null;
};

// Creates the agent row plus the per-agent rows every screen expects to
// find (wallet, notification prefs, referral stats). Must run inside a
// transaction the caller owns — used by both the password-registration and
// Google sign-in routes so a new account is equally "complete" either way.
export async function provisionNewAgent(client: PoolClient, input: NewAgentInput): Promise<number> {
  const agentResult = await client.query(
    `INSERT INTO agents (agent_code, full_name, email, mobile, telegram_id, password_hash, pin_hash, google_id, avatar_url, security_deposit_completed, two_factor_enabled)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, FALSE)
     RETURNING id`,
    [
      input.agentCode,
      input.fullName,
      input.email,
      input.mobile ?? null,
      input.telegramId ?? null,
      input.passwordHash ?? null,
      input.pinHash ?? null,
      input.googleId ?? null,
      input.avatarUrl ?? null,
    ]
  );
  const agentId = agentResult.rows[0].id;

  await client.query(`INSERT INTO wallets (agent_id, balance_usdt, fixed_rate_inr) VALUES ($1, 0, 110)`, [agentId]);
  await client.query(
    `INSERT INTO notification_preferences (agent_id, email_notifications, telegram_notifications) VALUES ($1, TRUE, TRUE)`,
    [agentId]
  );

  const referralCode = `PV-${input.agentCode.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 10)}`;
  await client.query(
    `INSERT INTO referral_stats (agent_id, referral_code, successful_referrals, agentship_requirement, agentship_unlocked)
     VALUES ($1, $2, 0, 3, FALSE)`,
    [agentId, referralCode]
  );

  return agentId;
}
