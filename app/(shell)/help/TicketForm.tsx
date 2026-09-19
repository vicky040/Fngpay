"use client";

import { useState } from "react";
import { Icon } from "../../components/Icon";

export function TicketForm() {
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, details }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't submit ticket.");
        setSubmitting(false);
        return;
      }
      setSuccess(true);
      setSubject("");
      setDetails("");
    } catch {
      setError("Couldn't reach the server. Is the app running?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <div className="card-head-icon">
        <div className="card-icon-tile blue">
          <Icon name="info" />
        </div>
        <div>
          <div className="card-head-title">Raise a Ticket</div>
          <div className="card-head-sub">Describe your issue and the operations team will follow up.</div>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="form-row c1">
            <div className="field">
              <label className="field-label" htmlFor="ticketSubject">
                Subject
              </label>
              <input id="ticketSubject" name="ticketSubject" className="input" placeholder="Brief summary" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
          </div>
          <div className="form-row c1">
            <div className="field">
              <label className="field-label" htmlFor="ticketDetails">
                Details
              </label>
              <textarea
                id="ticketDetails"
                name="ticketDetails"
                placeholder="What happened, and what do you need help with?"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                required
                style={{
                  width: "100%",
                  minHeight: 88,
                  boxSizing: "border-box",
                  padding: "9px 10px",
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  color: "var(--ink-800)",
                  background: "var(--paper)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--r-md)",
                  resize: "vertical",
                }}
              />
            </div>
          </div>

          {error ? <div className="field-error">{error}</div> : null}
          {success ? <div style={{ fontSize: 12.5, color: "var(--moss-600)" }}>Ticket submitted — the operations team will follow up.</div> : null}

          <div style={{ marginTop: 12 }}>
            <button type="submit" className="btn-secondary" style={{ width: "100%", height: 44, fontSize: 14 }} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
