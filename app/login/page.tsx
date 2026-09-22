import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAgent } from "@/lib/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in — Fngpay",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const agent = await getSessionAgent();
  if (agent) redirect("/");
  const { error } = await searchParams;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <header
        className="pv-chrome"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, padding: "0 16px", flexShrink: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 14,
            color: "#fff",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
          }}>
            FN
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: "0.02em" }}>
              FNG<span style={{ color: "#10B981" }}>PAY</span>
            </div>
            <div style={{ fontSize: 9, color: "#9CA3AF", marginTop: -2, letterSpacing: "0.05em" }}>
              P2P PARTNER PANEL
            </div>
          </div>
        </div>
        <Link href="/register" style={{ fontSize: 13, fontWeight: 600, color: "#10B981", padding: "6px 12px", borderRadius: 6, border: "1px solid #10B981", textDecoration: "none" }}>
          Register
        </Link>
      </header>

      <main className="pv-auth" style={{ width: "100%", flex: 1, padding: "18px 16px 40px", boxSizing: "border-box" }}>
        {error ? (
          <div className="field-error" style={{ marginBottom: 14, textAlign: "center" }}>
            {error}
          </div>
        ) : null}

        <LoginForm />
      </main>
    </div>
  );
}
