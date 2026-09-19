import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { hashSecret, verifySecret } from "@/lib/auth";
import { requireApiAgent } from "@/lib/api-auth";

export async function POST(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmNewPassword = String(body.confirmNewPassword ?? "");

  if (!newPassword || !confirmNewPassword) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (newPassword !== confirmNewPassword) {
    return NextResponse.json({ error: "New password and confirmation don't match." }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
  }

  const { rows } = await pool.query("SELECT password_hash FROM agents WHERE id = $1", [auth.agent.id]);
  const hasExistingPassword = Boolean(rows[0].password_hash);

  if (hasExistingPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const valid = await verifySecret(currentPassword, rows[0].password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }
  }

  const newHash = await hashSecret(newPassword);
  await pool.query("UPDATE agents SET password_hash = $1 WHERE id = $2", [newHash, auth.agent.id]);

  return NextResponse.json({ ok: true });
}
