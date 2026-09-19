import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{ question: string; answer: string }>("SELECT question, answer FROM faqs ORDER BY sort_order");
  return NextResponse.json({ faqs: rows });
}
