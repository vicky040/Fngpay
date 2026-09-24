"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";

type Bank = {
  id: number;
  bankName: string;
  accountLast4: string;
};

type WithdrawalRequest = {
  id: number;
  amountUsdt: string;
  amountInr: string;
  bankName: string;
  accountLast4: string;
  status: string;
  createdAt: string;
  rejectionReason?: string;
};

type PayoutData = {
  balanceUsdt: string;
  approxInr: string;
  exchangeRate: string;
  banks: Bank[];
  withdrawals: WithdrawalRequest[];
};

export function PayoutView() {
  const [data, setData] = useState<PayoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"idle" | "form">("idle");
  const [amountUsdt, setAmountUsdt] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/payout");
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const d = await res.json();
      setData(d);
      if (d.banks.length > 0) {
        setSelectedBankId(d.banks[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payout data");
    }
  }

  async function submitWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const amount = Number(amountUsdt);
    const MIN_WITHDRAWAL = 100; // Minimum 100 USDT

    if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
      setFormError(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
      return;
    }

    if (!selectedBankId) {
      setFormError("Please select a bank account");
      return;
    }

    const balance = Number(data?.balanceUsdt || 0);
    if (amount > balance) {
      setFormError(`Insufficient balance. You have ${balance} USDT`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/payout/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUsdt: amount,
          linkedBankId: selectedBankId,
        }),
      });

      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Couldn't create withdrawal request");
        return;
      }

      // Success!
      setView("idle");
      setAmountUsdt("");
      await loadData(); // Reload to show new request
    } catch {
      setFormError("Couldn't create withdrawal request — please try again");
    } finally {
      setSubmitting(false);
    }
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: "🟡 Pending", color: "#f59e0b", bgColor: "#fef3c7" },
    approved: { label: "🔵 Approved", color: "#3b82f6", bgColor: "#dbeafe" },
    completed: { label: "✅ Completed", color: "#10b981", bgColor: "#d1fae5" },
    rejected: { label: "🔴 Rejected", color: "#ef4444", bgColor: "#fee2e2" },
  };

  if (error) {
    return <div className="field-error" style={{ marginTop: 14 }}>{error}</div>;
  }

  if (!data) {
    return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 14 }}>Loading…</div>;
  }

  const hasBanks = data.banks.length > 0;

  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Payout Orders</h2>
          <p style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 4 }}>
            Request withdrawals to your linked bank accounts
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div style={{ background: "var(--moss-50)", border: "1px solid var(--moss-100)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--moss-600)" }}>
              Available Balance
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--ink-900)", marginTop: 6 }}>
              {data.balanceUsdt} USDT
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ash-600)", marginTop: 4 }}>
              ≈ ₹{data.approxInr}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)", marginTop: 2 }}>
              Rate: {data.exchangeRate} INR/USDT
            </div>
          </div>

          {hasBanks ? (
            <button
              type="button"
              onClick={() => setView(view === "form" ? "idle" : "form")}
              className="btn-primary"
              style={{ height: 42, minWidth: 140 }}
            >
              {view === "form" ? "Cancel" : "Request Withdrawal"}
            </button>
          ) : null}
        </div>
      </div>

      {/* No Banks Warning */}
      {!hasBanks && (
        <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <Icon name="info" style={{ width: 18, height: 18, color: "#f59e0b", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "#92400e", marginBottom: 4 }}>No bank accounts added</div>
              <div style={{ fontSize: 12.5, color: "#78350f", marginBottom: 8 }}>
                You need to add at least one bank account before requesting withdrawals.
              </div>
              <Link href="/banks" className="btn-secondary" style={{ height: 36, fontSize: 13, display: "inline-flex", alignItems: "center" }}>
                Add Bank Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Request Form */}
      {view === "form" && hasBanks && (
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 12 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
            Request Withdrawal
          </div>

          <form onSubmit={submitWithdrawal}>
            {/* Select Bank */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginBottom: 8 }}>
                Select Bank Account
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {data.banks.map((bank) => (
                  <label
                    key={bank.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: 12,
                      border: `2px solid ${selectedBankId === bank.id ? "var(--moss-500)" : "var(--border)"}`,
                      borderRadius: "var(--r-md)",
                      cursor: "pointer",
                      background: selectedBankId === bank.id ? "var(--moss-50)" : "var(--canvas)",
                    }}
                  >
                    <input
                      type="radio"
                      name="bank"
                      checked={selectedBankId === bank.id}
                      onChange={() => setSelectedBankId(bank.id)}
                      style={{ width: 18, height: 18 }}
                    />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ink-900)" }}>
                        {bank.bankName} ****{bank.accountLast4}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginBottom: 6 }}>
                Amount (USDT)
              </div>
              <input
                type="number"
                step="0.01"
                min="100"
                value={amountUsdt}
                onChange={(e) => setAmountUsdt(e.target.value)}
                placeholder="Minimum 100 USDT"
                style={{
                  width: "100%",
                  height: 42,
                  borderRadius: "var(--r-md)",
                  border: "1px solid var(--border)",
                  padding: "0 12px",
                  fontSize: 14,
                }}
              />
              {amountUsdt && Number(amountUsdt) > 0 && (
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ash-600)", marginTop: 4 }}>
                  = ₹{(Number(amountUsdt) * Number(data.exchangeRate)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 0 })}
                </div>
              )}
            </div>

            {formError && <div className="field-error" style={{ marginBottom: 12 }}>{formError}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: "100%", height: 42 }}
            >
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>
      )}

      {/* Withdrawal Requests List */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
          Your Withdrawal Requests
        </div>

        {data.withdrawals.length === 0 ? (
          <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, textAlign: "center" }}>
            <Icon name="arrow-right" style={{ width: 32, height: 32, color: "var(--ash-400)", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
              No withdrawal requests yet
            </div>
            <div style={{ fontSize: 12, color: "var(--ash-500)" }}>
              Your withdrawal requests will appear here with status updates
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.withdrawals.map((w) => {
              const statusConfig = STATUS_CONFIG[w.status] || { label: w.status, color: "var(--ash-500)", bgColor: "var(--ash-100)" };

              return (
                <div
                  key={w.id}
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 20, fontWeight: 600, color: "var(--ink-900)" }}>
                        {w.amountUsdt} USDT
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ash-600)", marginTop: 2 }}>
                        ≈ ₹{w.amountInr}
                      </div>
                    </div>
                    <div
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--r-sm)",
                        background: statusConfig.bgColor,
                        fontSize: 12,
                        fontWeight: 600,
                        color: statusConfig.color,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {statusConfig.label}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "var(--ash-600)", marginBottom: 4 }}>
                    To: {w.bankName} ****{w.accountLast4}
                  </div>

                  <div style={{ fontSize: 11, color: "var(--ash-500)" }}>
                    Requested: {w.createdAt}
                  </div>

                  {w.status === "rejected" && w.rejectionReason && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: 10,
                        background: "#fee2e2",
                        borderRadius: "var(--r-sm)",
                        border: "1px solid #fecaca",
                      }}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#991b1b", marginBottom: 4 }}>
                        Rejection Reason:
                      </div>
                      <div style={{ fontSize: 12, color: "#7f1d1d" }}>
                        {w.rejectionReason}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
