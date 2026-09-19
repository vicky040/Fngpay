"use client";

import { useState } from "react";
import { Icon } from "../../components/Icon";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't update password.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setError("Couldn't reach the server. Is the app running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-head-icon">
        <div className="card-icon-tile">
          <Icon name="user" />
        </div>
        <div>
          <div className="card-head-title">Change login password</div>
          <div className="card-head-sub">Update the password you use to sign in.</div>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="form-row c1">
            <div className="field">
              <label className="field-label" htmlFor="currentPassword">
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                className="input"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
          </div>
          <div className="form-row c1">
            <div className="field">
              <label className="field-label" htmlFor="newPassword">
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                className="input"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-row c1">
            <div className="field">
              <label className="field-label" htmlFor="confirmNewPassword">
                Confirm new password
              </label>
              <input
                id="confirmNewPassword"
                name="confirmNewPassword"
                type="password"
                className="input"
                placeholder="••••••••"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error ? <div className="field-error">{error}</div> : null}
          {success ? <div style={{ fontSize: 12.5, color: "var(--moss-600)", marginTop: 6 }}>Password updated.</div> : null}

          <div style={{ marginTop: 6 }}>
            <button type="submit" className="btn-save" style={{ width: "100%", height: 44, fontSize: 14 }} disabled={submitting}>
              {submitting ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
