import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{ name: string; short_code: string; mark: string }>(
    "SELECT name, short_code, mark FROM bank_reference ORDER BY name"
  );

  return NextResponse.json({ banks: rows.map((r) => ({ name: r.name, short: r.short_code, mark: r.mark })) });
}
