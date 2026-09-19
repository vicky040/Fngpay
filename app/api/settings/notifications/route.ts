import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const email = Boolean(body.email);
  const telegram = Boolean(body.telegram);

  await pool.query(
    `UPDATE notification_preferences SET email_notifications = $1, telegram_notifications = $2 WHERE agent_id = $3`,
    [email, telegram, auth.agent.id]
  );

  return NextResponse.json({ ok: true });
}
