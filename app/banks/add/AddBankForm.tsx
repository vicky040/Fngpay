"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "../../components/Icon";

export function AddBankForm({ bank }: { bank: { name: string; short: string; mark: string } }) {
  const router = useRouter();
  const [holder, setHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/banks/linked", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bank.name,
          bankShort: bank.short,
          accountHolder: holder,
          accountNumber,
          confirmAccountNumber,
          ifscCode: ifsc,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save this bank account.");
        setSubmitting(false);
        return;
      }
      router.push("/banks");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Is the app running?");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="pv-auth" style={{ width: "100%", flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 16px 28px", background: "var(--canvas)", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              flexShrink: 0,
              borderRadius: "var(--r-md)",
              background: "var(--canvas)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--ink-700)",
            }}
          >
            {bank.mark}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-900)" }}>{bank.name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--moss-600)", marginTop: 3 }}>{bank.short}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-head-icon">
              <div className="card-icon-tile">
                <Icon name="budget" />
              </div>
              <div>
                <div className="card-head-title">Account details</div>
                <div className="card-head-sub">Enter the account exactly as it appears in your bank records.</div>
              </div>
            </div>
            <div className="card-body">
              <form id="add-bank-form" onSubmit={onSubmit}>
                <div className="form-row c1">
                  <div className="field">
                    <label className="field-label" htmlFor="holder">
                      Account holder name <span className="req">*</span>
                    </label>
                    <input id="holder" name="holder" className="input" placeholder="As per bank records" value={holder} onChange={(e) => setHolder(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row c1">
                  <div className="field">
                    <label className="field-label" htmlFor="accountNumber">
                      Account number <span className="req">*</span>
                    </label>
                    <input
                      id="accountNumber"
                      name="accountNumber"
                      className="input mono"
                      placeholder="Account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row c1">
                  <div className="field">
                    <label className="field-label" htmlFor="confirmAccountNumber">
                      Confirm account number <span className="req">*</span>
                    </label>
                    <input
                      id="confirmAccountNumber"
                      name="confirmAccountNumber"
                      className="input mono"
                      placeholder="Re-enter account number"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-row c1">
                  <div className="field">
                    <label className="field-label" htmlFor="ifsc">
                      IFSC code <span className="req">*</span>
                    </label>
                    <input id="ifsc" name="ifsc" className="input mono" placeholder="E.G. SBIN0001234" value={ifsc} onChange={(e) => setIfsc(e.target.value)} required />
                  </div>
                </div>

                {error ? <div className="field-error">{error}</div> : null}
              </form>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 14, padding: "0 2px" }}>
          <span style={{ color: "var(--ash-500)", display: "flex", paddingTop: 1 }}>
            <Icon name="info" style={{ width: 16, height: 16 }} />
          </span>
          <div style={{ fontSize: 12, color: "var(--ash-600)" }}>Details are stored for settlement only. No live bank OTP verification in this phase.</div>
        </div>
      </div>

      <div style={{ padding: "12px 16px", background: "var(--paper)", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <button type="submit" form="add-bank-form" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }} disabled={submitting}>
          {submitting ? "Saving…" : "Save bank account"}
        </button>
      </div>
    </>
  );
}
