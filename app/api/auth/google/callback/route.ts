import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/session";
import { provisionNewAgent } from "@/lib/agents";
import { exchangeGoogleCode } from "@/lib/google-oauth";
import { GOOGLE_STATE_COOKIE } from "../route";

function loginError(origin: string, message: string) {
  const res = NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(message)}`);
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith(`${GOOGLE_STATE_COOKIE}=`))
    ?.split("=")[1];

  if (url.searchParams.get("error")) {
    return loginError(origin, "Google sign-in was cancelled.");
  }
  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError(origin, "Google sign-in failed to verify — please try again.");
  }

  let profile;
  try {
    profile = await exchangeGoogleCode(code, origin);
  } catch (err) {
    console.error("Google OAuth exchange failed:", err);
    return loginError(origin, "Couldn't complete Google sign-in — please try again.");
  }

  if (!profile.email_verified) {
    return loginError(origin, "That Google account's email isn't verified.");
  }

  const byGoogleId = await pool.query("SELECT id FROM agents WHERE google_id = $1", [profile.sub]);
  if (byGoogleId.rows.length > 0) {
    await createSession(byGoogleId.rows[0].id);
    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  }

  const byEmail = await pool.query("SELECT id FROM agents WHERE email = $1", [profile.email.toLowerCase()]);
  if (byEmail.rows.length > 0) {
    const agentId = byEmail.rows[0].id;
    await pool.query("UPDATE agents SET google_id = $1, avatar_url = COALESCE(avatar_url, $2) WHERE id = $3", [
      profile.sub,
      profile.picture ?? null,
      agentId,
    ]);
    await createSession(agentId);
    const res = NextResponse.redirect(`${origin}/`);
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  }

  // First time this Google account has signed in — provision a new agent.
  // Agent codes are otherwise player-chosen at registration; Google sign-in
  // has no such field, so mint one (16^8 keyspace — collision odds are
  // negligible, same reasoning as the session-token generator).
  const agentCode = `PV-G-${randomBytes(4).toString("hex").toUpperCase()}`;
  const client = await pool.connect();
  let agentId: number;
  try {
    await client.query("BEGIN");
    agentId = await provisionNewAgent(client, {
      agentCode,
      fullName: profile.name || profile.email,
      email: profile.email.toLowerCase(),
      googleId: profile.sub,
      avatarUrl: profile.picture,
    });
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed to provision Google agent:", err);
    return loginError(origin, "Couldn't create an account for that Google sign-in — please try again.");
  } finally {
    client.release();
  }

  await createSession(agentId);
  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.delete(GOOGLE_STATE_COOKIE);
  return res;
}
