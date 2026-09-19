import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const subject = String(body.subject ?? "").trim();
  const details = String(body.details ?? "").trim();

  if (!subject || !details) {
    return NextResponse.json({ error: "Subject and details are both required." }, { status: 400 });
  }

  await pool.query("INSERT INTO support_tickets (agent_id, subject, details) VALUES ($1, $2, $3)", [auth.agent.id, subject, details]);

  return NextResponse.json({ ok: true });
}
