import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashSecret, verifySecret } from "@/lib/auth";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const currentPin = String(body.currentPin ?? "");
  const newPin = String(body.newPin ?? "");
  const confirmNewPin = String(body.confirmNewPin ?? "");

  if (!newPin || !confirmNewPin) {
    return NextResponse.json({ error: "Enter and confirm your new transaction PIN." }, { status: 400 });
  }
  if (newPin !== confirmNewPin) {
    return NextResponse.json({ error: "New PIN and confirmation don't match." }, { status: 400 });
  }
  if (!/^\d{4,6}$/.test(newPin)) {
    return NextResponse.json({ error: "PIN must be 4-6 digits." }, { status: 400 });
  }

  const { rows } = await pool.query("SELECT pin_hash FROM agents WHERE id = $1", [auth.agent.id]);
  if (rows[0].pin_hash) {
    const valid = await verifySecret(currentPin, rows[0].pin_hash);
    if (!valid) {
      return NextResponse.json({ error: "Current PIN is incorrect." }, { status: 401 });
    }
  }

  const newHash = await hashSecret(newPin);
  await pool.query("UPDATE agents SET pin_hash = $1 WHERE id = $2", [newHash, auth.agent.id]);

  return NextResponse.json({ ok: true });
}
