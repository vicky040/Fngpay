"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "../components/Icon";

export function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setSubmitting(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Is the app running?");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-head-icon">
          <div className="card-icon-tile">
            <Icon name="user" />
          </div>
          <div>
            <div className="card-head-title">Log in to FNGPAY</div>
            <div className="card-head-sub">Use your Agent ID or registered email. Authenticator code required only if 2FA is enabled.</div>
          </div>
        </div>

        <div className="card-body">
          <form id="login-form" onSubmit={onSubmit}>
            <div className="form-row c1">
              <div className="field">
                <label className="field-label" htmlFor="agentId">
                  Agent ID / Email Address <span className="req">*</span>
                </label>
                <input
                  id="agentId"
                  name="agentId"
                  className="input"
                  placeholder="PV-XXXX-XXXX or name@company.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row c1">
              <div className="field">
                <label className="field-label" htmlFor="password">
                  Login Password <span className="req">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row c1">
              <div className="field">
                <label className="field-label" htmlFor="otp">
                  Authenticator Code <span style={{ fontSize: 11, color: "var(--ash-500)", fontWeight: 400 }}>(if 2FA enabled)</span>
                </label>
                <input
                  id="otp"
                  name="otp"
                  className="input mono"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="field-hint">
                  <Icon name="info" />
                  6-digit code from your authenticator app (leave empty if 2FA is disabled).
                </div>
              </div>
            </div>

            {error ? <div className="field-error">{error}</div> : null}
          </form>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 2px", marginTop: 16 }}>
        <button type="submit" form="login-form" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }} disabled={submitting}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ash-600)" }}>
          Forgot password? <a href="#">Reset via Telegram support</a>
        </div>
        <Link href="/register" style={{ textAlign: "center", fontSize: 13, color: "var(--ash-600)" }}>
          Don&apos;t have an account? <span style={{ color: "var(--moss-600)", fontWeight: 500 }}>Register</span>
        </Link>
      </div>
    </>
  );
}
