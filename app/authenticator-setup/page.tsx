import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAgent } from "@/lib/session";
import { Icon } from "../components/Icon";
import { SetupClient } from "./SetupClient";

export const metadata: Metadata = {
  title: "Set up your authenticator — Fngpay",
};

export default async function AuthenticatorSetupPage() {
  const agent = await getSessionAgent();
  if (!agent) redirect("/login");
  if (agent.twoFactorEnabled) redirect("/");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <header
        className="pv-chrome"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, padding: "0 16px", flexShrink: 0 }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: ".16em", color: "#fff", textTransform: "uppercase" }}>
          Fngpay
        </div>
      </header>

      <main className="pv-auth" style={{ width: "100%", flex: 1, padding: "18px 16px 40px", boxSizing: "border-box" }}>
        <div className="card">
          <div className="card-head-icon">
            <div className="card-icon-tile">
              <Icon name="info" />
            </div>
            <div>
              <div className="card-head-title">Set up your authenticator</div>
              <div className="card-head-sub">One-time step — this account can&apos;t sign in again until it&apos;s done.</div>
            </div>
          </div>
          <div className="card-body">
            <SetupClient />
          </div>
        </div>
      </main>
    </div>
  );
}
