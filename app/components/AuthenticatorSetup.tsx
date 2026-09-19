"use client";

import { useEffect, useState } from "react";

type SetupData = { secret: string; qrDataUri: string };

function formatSecret(secret: string) {
  return secret.match(/.{1,4}/g)?.join(" ") ?? secret;
}

export function AuthenticatorSetup({ onConfirmed }: { onConfirmed: () => void }) {
  const [data, setData] = useState<SetupData | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/totp/setup", { method: "POST" })
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : "Failed to generate a setup code");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Couldn't confirm that code.");
        setSubmitting(false);
        return;
      }
      onConfirmed();
    } catch {
      setError("Couldn't reach the server. Is the app running?");
      setSubmitting(false);
    }
  }

  if (loadError) return <div className="field-error">{loadError}</div>;
  if (!data) return <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Generating your setup code…</div>;

  return (
    <div>
      <ol style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 14, fontSize: 13, color: "var(--ink-800)" }}>
        <li>
          Install an authenticator app if you don&apos;t have one — Google Authenticator, Authy, or Microsoft Authenticator all work.
        </li>
        <li>
          Scan this QR code in the app:
          <div style={{ marginTop: 10, background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16, display: "inline-block" }}>
            {/* Locally-generated data URI, never leaves this server. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.qrDataUri} alt="Authenticator QR code" width={180} height={180} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--ash-600)" }}>
            Can&apos;t scan it? Enter this key manually:
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-800)", marginTop: 4, wordBreak: "break-all" }}>
              {formatSecret(data.secret)}
            </div>
          </div>
        </li>
        <li>
          Enter the 6-digit code the app is showing right now:
          <form onSubmit={onSubmit} style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10, maxWidth: 280 }}>
            <input
              className="input mono"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
            />
            {error ? <div className="field-error">{error}</div> : null}
            <button type="submit" className="btn-primary" style={{ height: 44, fontSize: 14, justifyContent: "center" }} disabled={submitting}>
              {submitting ? "Confirming…" : "Confirm & enable"}
            </button>
          </form>
        </li>
      </ol>
    </div>
  );
}
