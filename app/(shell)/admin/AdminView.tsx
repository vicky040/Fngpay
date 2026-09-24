"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";

type Agent = {
  id: number;
  agentCode: string;
  fullName: string;
};

type WithdrawalRequest = {
  id: number;
  agentCode: string;
  agentName: string;
  amountUsdt: string;
  amountInr: string;
  bankName: string;
  accountLast4: string;
  status: string;
  createdAt: string;
  rejectionReason?: string;
};

type AdminData = {
  currentRate: string;
  pendingCount: number;
  withdrawals: WithdrawalRequest[];
};

export function AdminView({ admin }: { admin: Agent }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newRate, setNewRate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const d = await res.json();
      setData(d);
      setNewRate(d.currentRate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admin data");
    }
  }

  async function updateExchangeRate(e: React.FormEvent) {
    e.preventDefault();
    const rate = Number(newRate);
    if (!rate || rate <= 0 || rate > 1000) {
      alert("Please enter a valid rate between 0 and 1000");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/exchange-rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRate: rate }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to update rate");
      }

      alert(`✅ Exchange rate updated to ${rate} INR/USDT`);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update rate");
    } finally {
      setSubmitting(false);
    }
  }

  async function approveWithdrawal(id: number) {
    if (!confirm("Approve this withdrawal request?")) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to approve");
      }

      alert("✅ Withdrawal approved! Remember to make the bank transfer, then mark as completed.");
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve withdrawal");
    }
  }

  async function completeWithdrawal(id: number) {
    if (!confirm("Mark this withdrawal as completed? This will deduct the balance from user's wallet.")) return;

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to complete");
      }

      alert("✅ Withdrawal completed! User's balance has been updated.");
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to complete withdrawal");
    }
  }

  async function rejectWithdrawal(id: number) {
    if (!rejectReason.trim()) {
      alert("Please enter a rejection reason");
      return;
    }

    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to reject");
      }

      alert("✅ Withdrawal rejected");
      setRejectingId(null);
      setRejectReason("");
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to reject withdrawal");
    }
  }

  const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    pending: { label: "🟡 Pending", color: "#f59e0b" },
    approved: { label: "🔵 Approved", color: "#3b82f6" },
    completed: { label: "✅ Completed", color: "#10b981" },
    rejected: { label: "🔴 Rejected", color: "#ef4444" },
  };

  if (error) {
    return (
      <div style={{ marginTop: 12 }}>
        <div className="field-error">{error}</div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>;
  }

  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Admin Panel</h2>
          <p style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 4 }}>
            Manage exchange rates and withdrawal requests
          </p>
        </div>
      </div>

      {/* Exchange Rate Management */}
      <div style={{ background: "var(--moss-50)", border: "1px solid var(--moss-100)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <Icon name="asset" style={{ width: 20, height: 20, color: "var(--moss-600)" }} />
          <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>Exchange Rate Management</div>
        </div>

        <div style={{ background: "var(--paper)", borderRadius: "var(--r-md)", padding: 14, marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--ash-600)", marginBottom: 4 }}>Current Rate</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--moss-600)" }}>
            {data.currentRate} INR/USDT
          </div>
        </div>

        <form onSubmit={updateExchangeRate}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginBottom: 6 }}>Update Rate</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              step="0.01"
              min="1"
              max="1000"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              placeholder="Enter new rate"
              style={{
                flex: 1,
                height: 42,
                borderRadius: "var(--r-md)",
                border: "1px solid var(--border)",
                padding: "0 12px",
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ height: 42, minWidth: 120 }}
            >
              {submitting ? "Updating…" : "Update Rate"}
            </button>
          </div>
        </form>
      </div>

      {/* Withdrawal Requests */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)" }}>Withdrawal Requests</div>
            <div style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 2 }}>
              {data.pendingCount} pending request{data.pendingCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        {data.withdrawals.length === 0 ? (
          <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--ash-500)" }}>No withdrawal requests found.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.withdrawals.map((w) => {
              const statusConfig = STATUS_CONFIG[w.status] || { label: w.status, color: "var(--ash-500)" };

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
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      {/* User Info */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>{w.agentName}</div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "var(--ash-100)",
                            color: "var(--ash-600)",
                          }}
                        >
                          {w.agentCode}
                        </div>
                      </div>

                      {/* Amount */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--ink-900)" }}>
                          {w.amountUsdt} USDT
                        </div>
                        <div style={{ fontSize: 13, color: "var(--ash-600)" }}>→ ₹{w.amountInr}</div>
                      </div>

                      {/* Bank */}
                      <div style={{ fontSize: 12, color: "var(--ash-600)", marginBottom: 6 }}>
                        To: {w.bankName} ****{w.accountLast4}
                      </div>

                      {/* Status & Time */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: statusConfig.color }}>
                          {statusConfig.label}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--ash-500)" }}>{w.createdAt}</div>
                      </div>

                      {/* Rejection Reason */}
                      {w.status === "rejected" && w.rejectionReason && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 8,
                            background: "var(--canvas)",
                            borderRadius: "var(--r-sm)",
                            fontSize: 12,
                            color: "var(--ash-600)",
                          }}
                        >
                          <strong>Reason:</strong> {w.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {w.status === "pending" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 120 }}>
                        <button
                          onClick={() => approveWithdrawal(w.id)}
                          className="btn-primary"
                          style={{ height: 38, fontSize: 13 }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(w.id)}
                          className="btn-secondary"
                          style={{ height: 38, fontSize: 13 }}
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {w.status === "approved" && (
                      <div style={{ minWidth: 120 }}>
                        <button
                          onClick={() => completeWithdrawal(w.id)}
                          className="btn-primary"
                          style={{ height: 38, fontSize: 13, width: "100%" }}
                        >
                          Mark Completed
                        </button>
                        <div style={{ fontSize: 10, color: "var(--ash-500)", marginTop: 4, textAlign: "center" }}>
                          After bank transfer
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rejection Modal */}
                  {rejectingId === w.id && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: "var(--canvas)",
                        borderRadius: "var(--r-md)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginBottom: 8 }}>
                        Rejection Reason
                      </div>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows={3}
                        style={{
                          width: "100%",
                          borderRadius: "var(--r-md)",
                          border: "1px solid var(--border)",
                          padding: 8,
                          fontSize: 13,
                          resize: "vertical",
                        }}
                      />
                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                          className="btn-secondary"
                          style={{ flex: 1, height: 36, fontSize: 13 }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => rejectWithdrawal(w.id)}
                          className="btn-primary"
                          style={{ flex: 1, height: 36, fontSize: 13, background: "#ef4444" }}
                        >
                          Confirm Reject
                        </button>
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
