import { NextResponse } from "next/server";
import { getSessionAgent, type Agent } from "./session";

// For Route Handlers: returns the agent, or a ready-to-return 401 response.
export async function requireApiAgent(): Promise<{ agent: Agent } | { error: NextResponse }> {
  const agent = await getSessionAgent();
  if (!agent) {
    return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }
  return { agent };
}
