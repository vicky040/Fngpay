"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Checkbox } from "../../components/Checkbox";
import { AuthenticatorSetup } from "../../components/AuthenticatorSetup";

type Profile = { label: string; value: string }[];

function Card({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14 }}>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 3 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function PinUpdateForm() {
  const [open, setOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin, confirmNewPin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't update PIN.");
        return;
      }
      setSuccess(true);
      setCurrentPin("");
      setNewPin("");
      setConfirmNewPin("");
    } catch {
      setError("Couldn't reach the server. Is the app running?");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <div style={{ marginTop: 12 }}>
        <button type="button" className="btn-secondary" style={{ height: 44, padding: "0 20px" }} onClick={() => setOpen(true)}>
          Update PIN
        </button>
        {success ? <div style={{ fontSize: 12.5, color: "var(--moss-600)", marginTop: 8 }}>PIN updated.</div> : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="field">
        <label className="field-label" htmlFor="currentPin">
          Current PIN
        </label>
        <input id="currentPin" className="input mono" placeholder="4-6 digits" value={currentPin} onChange={(e) => setCurrentPin(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="newPin">
          New PIN
        </label>
        <input id="newPin" className="input mono" placeholder="4-6 digits" value={newPin} onChange={(e) => setNewPin(e.target.value)} required />
      </div>
      <div className="field">
        <label className="field-label" htmlFor="confirmNewPin">
          Confirm new PIN
        </label>
        <input id="confirmNewPin" className="input mono" placeholder="4-6 digits" value={confirmNewPin} onChange={(e) => setConfirmNewPin(e.target.value)} required />
      </div>
      {error ? <div className="field-error">{error}</div> : null}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" className="btn-save" style={{ height: 44, padding: "0 20px" }} disabled={submitting}>
          {submitting ? "Saving…" : "Save PIN"}
        </button>
        <button type="button" className="btn-cancel" style={{ height: 44, padding: "0 16px" }} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function DisableAuthenticatorForm({ onDisabled }: { onDisabled: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/totp/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't disable authenticator.");
        return;
      }
      onDisabled();
    } catch {
      setError("Couldn't reach the server. Is the app running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10, maxWidth: 280 }}>
      <div className="field">
        <label className="field-label" htmlFor="disableCode">
          Current authenticator code
        </label>
        <input id="disableCode" className="input mono" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} required />
      </div>
      {error ? <div className="field-error">{error}</div> : null}
      <button type="submit" className="btn-danger" style={{ height: 44 }} disabled={submitting}>
        {submitting ? "Disabling…" : "Disable authenticator"}
      </button>
    </form>
  );
}

function TwoFactorManager({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div style={{ marginTop: 12 }}>
        <button type="button" className="btn-secondary" style={{ height: 44, padding: "0 20px" }} onClick={() => setOpen(true)}>
          {enabled ? "Manage authenticator" : "Set up authenticator"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12 }}>
      {enabled ? (
        <DisableAuthenticatorForm
          onDisabled={() => {
            onChange(false);
            setOpen(false);
          }}
        />
      ) : (
        <AuthenticatorSetup
          onConfirmed={() => {
            onChange(true);
            setOpen(false);
          }}
        />
      )}
      <button type="button" className="btn-cancel" style={{ height: 36, marginTop: 10 }} onClick={() => setOpen(false)}>
        Cancel
      </button>
    </div>
  );
}

export function SettingsView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notifications, setNotifications] = useState<{ email: boolean; telegram: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setProfile(data.profile);
          setTwoFactorEnabled(data.twoFactorEnabled);
          setNotifications(data.notifications);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load settings");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateNotifications(next: { email: boolean; telegram: boolean }) {
    setNotifications(next);
    await fetch("/api/settings/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  }

  if (error) return <div className="field-error" style={{ marginTop: 12 }}>{error}</div>;
  if (!profile || !notifications) return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
      <Card title="Profile" subtitle="Account identity details.">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginTop: 14 }}>
          {profile.map((p) => (
            <div key={p.label}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ash-500)" }}>{p.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-800)", marginTop: 4, wordBreak: "break-word" }}>{p.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Login Password" subtitle="Change your sign-in password. Sensitive updates require re-authentication.">
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <Link href="/password" className="btn-secondary" style={{ height: 44, padding: "0 20px" }}>
            Change password
          </Link>
          <span style={{ fontSize: 12.5, color: "var(--ash-600)" }}>Re-authenticate</span>
        </div>
      </Card>

      <Card title="Transaction PIN" subtitle="Used for high-risk actions in the trader panel.">
        <PinUpdateForm />
      </Card>

      <Card title="Authenticator App" subtitle="Real TOTP codes, compatible with Google Authenticator, Authy, or any authenticator app.">
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--ash-600)" }}>Status</span>
          <span className={`badge ${twoFactorEnabled ? "badge-green" : "badge-neutral"}`}>{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
        </div>
        <TwoFactorManager enabled={twoFactorEnabled} onChange={setTwoFactorEnabled} />
      </Card>

      <Card title="Notification Preferences" subtitle="Choose how you receive operational alerts.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          <Checkbox
            key={`email-${notifications.email}`}
            defaultChecked={notifications.email}
            onCheckedChange={(checked) => updateNotifications({ ...notifications, email: checked })}
          >
            Email notifications
          </Checkbox>
          <Checkbox
            key={`telegram-${notifications.telegram}`}
            defaultChecked={notifications.telegram}
            onCheckedChange={(checked) => updateNotifications({ ...notifications, telegram: checked })}
          >
            Telegram notifications
          </Checkbox>
        </div>
      </Card>
    </div>
  );
}
