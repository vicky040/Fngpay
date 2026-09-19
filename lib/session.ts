import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { pool } from "./db";

export const SESSION_COOKIE = "fngpay_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export type Agent = {
  id: number;
  agentCode: string;
  fullName: string;
  email: string;
  mobile: string | null;
  telegramId: string | null;
  twoFactorEnabled: boolean;
};

// Only callable from a Route Handler / Server Action — mutating cookies from
// a Server Component render throws (Next.js treats page cookies as read-only).
export async function createSession(agentId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await pool.query("INSERT INTO sessions (token, agent_id, expires_at) VALUES ($1, $2, $3)", [token, agentId, expiresAt]);

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
  }
  store.delete(SESSION_COOKIE);
}

// Safe to call from Server Components and Route Handlers alike (read-only).
export async function getSessionAgent(): Promise<Agent | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { rows } = await pool.query(
    `SELECT a.id, a.agent_code, a.full_name, a.email, a.mobile, a.telegram_id, a.two_factor_enabled
     FROM sessions s
     JOIN agents a ON a.id = s.agent_id
     WHERE s.token = $1 AND s.expires_at > now()`,
    [token]
  );
  if (rows.length === 0) return null;

  const r = rows[0];
  return {
    id: r.id,
    agentCode: r.agent_code,
    fullName: r.full_name,
    email: r.email,
    mobile: r.mobile,
    telegramId: r.telegram_id,
    twoFactorEnabled: r.two_factor_enabled,
  };
}
