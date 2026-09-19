import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";

export async function GET(request: Request) {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  const { rows } = await pool.query<{
    referral_code: string;
    successful_referrals: number;
    agentship_requirement: number;
    agentship_unlocked: boolean;
  }>(
    "SELECT referral_code, successful_referrals, agentship_requirement, agentship_unlocked FROM referral_stats WHERE agent_id = $1",
    [auth.agent.id]
  );
  const r = rows[0];
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    referralCode: r.referral_code,
    referralLink: `${origin}/register?ref=${r.referral_code}`,
    successfulReferrals: r.successful_referrals,
    agentshipRequirement: r.agentship_requirement,
    agentshipUnlocked: r.agentship_unlocked,
  });
}
