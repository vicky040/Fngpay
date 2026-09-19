import { redirect } from "next/navigation";
import { getSessionAgent, type Agent } from "./session";

// For Server Component pages: redirects to /login when there's no session,
// or to the forced authenticator-setup step when the account hasn't
// completed it yet — nobody reaches real screens without both.
export async function requireAgent(): Promise<Agent> {
  const agent = await getSessionAgent();
  if (!agent) redirect("/login");
  if (!agent.twoFactorEnabled) redirect("/authenticator-setup");
  return agent;
}
