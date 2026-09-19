import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{
    two_factor_enabled: boolean;
    email_notifications: boolean;
    telegram_notifications: boolean;
  }>(
    `SELECT a.two_factor_enabled, n.email_notifications, n.telegram_notifications
     FROM agents a
     LEFT JOIN notification_preferences n ON n.agent_id = a.id
     WHERE a.id = $1`,
    [auth.agent.id]
  );
  const r = rows[0];

  return NextResponse.json({
    profile: [
      { label: "Full name", value: auth.agent.fullName },
      { label: "Agent code", value: auth.agent.agentCode },
      { label: "Email", value: auth.agent.email },
      { label: "Mobile", value: auth.agent.mobile ?? "Not provided" },
      { label: "Telegram", value: auth.agent.telegramId ?? "Not provided" },
    ],
    twoFactorEnabled: r.two_factor_enabled,
    notifications: {
      email: r.email_notifications ?? true,
      telegram: r.telegram_notifications ?? true,
    },
  });
}
