import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionAgent } from "@/lib/session";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register — Fngpay",
};

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const agent = await getSessionAgent();
  if (agent) redirect("/");
  const { error } = await searchParams;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--canvas)" }}>
      <header
        className="pv-chrome"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, padding: "0 16px", flexShrink: 0 }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, letterSpacing: ".16em", color: "#fff", textTransform: "uppercase" }}>
          Fngpay
        </div>
        <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: "var(--moss-400)", padding: 8 }}>
          Login
        </Link>
      </header>

      <main className="pv-auth" style={{ width: "100%", flex: 1, padding: "18px 16px 40px", boxSizing: "border-box" }}>
        {error ? (
          <div className="field-error" style={{ marginBottom: 14, textAlign: "center" }}>
            {error}
          </div>
        ) : null}

        <RegisterForm />
      </main>
    </div>
  );
}
