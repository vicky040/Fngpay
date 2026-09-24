"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";

type Bank = {
  id: number;
  bankName: string;
  accountLast4: string;
};

type HistoryEntry = {
  kind: string;
  type: string;
  sub: string;
  date: string;
  amount: string;
  bal: string;
};

type WithdrawalRequest = {
  id: number;
  amountUsdt: string;
  amountInr: string;
  exchangeRate: string;
  status: string;
  bankName: string;
  accountLast4: string;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
};

export function PayoutView() {
  const [balanceUsdt, setBalanceUsdt] = useState<string>("0.00");
  const [approxInr, setApproxInr] = useState<string>("0");
  const [exchangeRate, setExchangeRate] = useState<string>("104");
  const [banks, setBanks] = useState<Bank[]>([]);
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [requests, setRequests] = useState<WithdrawalRequest[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [amountUsdt, setAmountUsdt] = useState("");
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Load balance, rate, and banks
      const payoutRes = await fetch("/api/payout", { cache: 'no-store' });
      if (payoutRes.ok) {
        const payoutData = await payoutRes.json();
        console.log('Payout data received:', payoutData);
        setBalanceUsdt(payoutData.balanceUsdt || "0.00");
        setApproxInr(payoutData.approxInr || "0");
        setExchangeRate(payoutData.exchangeRate || "104");
        setBanks(payoutData.banks || []);
        if (payoutData.banks && payoutData.banks.length > 0) {
          setSelectedBankId(payoutData.banks[0].id);
        }
      }

      // Load banks directly if payout API didn't return them
      if (!banks || banks.length === 0) {
        const banksRes = await fetch("/api/banks", { cache: 'no-store' });
        if (banksRes.ok) {
          const banksData = await banksRes.json();
          console.log('Banks data received:', banksData);
          if (banksData.banks && banksData.banks.length > 0) {
            setBanks(banksData.banks);
            setSelectedBankId(banksData.banks[0].id);
          }
        }
      }

      // Load withdrawal history
      const historyRes = await fetch("/api/history?filter=withdrawals", { cache: 'no-store' });
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setEntries(historyData.entries || []);
      }

      // Load withdrawal requests
      const requestsRes = await fetch("/api/payout/requests", { cache: 'no-store' });
      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        console.log('Withdrawal requests received:', requestsData);
        setRequests(requestsData.requests || []);
      }
    } catch (err) {
      console.error('Error loading payout data:', err);
      setError(err instanceof Error ? err.message : "Failed to load payout data");
    }
  }

  async function submitWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const amount = Number(amountUsdt);
    const MIN_WITHDRAWAL = 100;

    if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) {
      setFormError(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
      return;
    }

    if (!selectedBankId) {
      setFormError("Please select a bank account");
      return;
    }

    const balance = Number(balanceUsdt.replace(/,/g, ''));
    if (amount > balance) {
      setFormError(`Insufficient balance. You have ${balanceUsdt} USDT`);
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

      alert("✅ Withdrawal request submitted! Admin will review shortly.");
      setAmountUsdt("");
      await loadData();
    } catch {
      setFormError("Couldn't create withdrawal request — please try again");
    } finally {
      setSubmitting(false);
    }
  }

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

      {error && (
        <div className="field-error" style={{ marginTop: 14 }}>{error}</div>
      )}

      {/* Balance Card */}
      <div style={{ background: "var(--moss-50)", border: "1px solid var(--moss-100)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 14 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--moss-600)" }}>
          Available Balance
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--ink-900)", marginTop: 6 }}>
          {balanceUsdt} USDT
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ash-600)", marginTop: 4 }}>
          ≈ ₹{approxInr}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)", marginTop: 2 }}>
          Rate: {exchangeRate} INR/USDT
        </div>
      </div>

      {/* Withdrawal Request Form */}
      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 12 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
          Request Withdrawal
        </div>

        {banks.length === 0 ? (
          <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "var(--r-md)", padding: 14, marginBottom: 12 }}>
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
        ) : (
          <form onSubmit={submitWithdrawal}>
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
                  = ₹{Math.round(Number(amountUsdt) * Number(exchangeRate)).toLocaleString('en-IN')}
                </div>
              )}
            </div>

            {/* Select Bank - Below Amount */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-900)", marginBottom: 8 }}>
                Select Bank Account
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {banks.map((bank) => (
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

            {formError && <div className="field-error" style={{ marginBottom: 12 }}>{formError}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ width: "100%", height: 42 }}
            >
              {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </button>
          </form>
        )}
      </div>

      {/* Withdrawal Requests - Only show pending and approved */}
      {requests && requests.filter(r => r.status === 'pending' || r.status === 'approved').length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
            Withdrawal Requests
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {requests.filter(r => r.status === 'pending' || r.status === 'approved').map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';

              return (
                <div
                  key={req.id}
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-900)" }}>
                          {req.amountUsdt} USDT
                        </div>
                        {isPending && <span className="badge" style={{ background: "#fef3c7", color: "#92400e" }}>⏳ Pending</span>}
                        {isApproved && <span className="badge" style={{ background: "#dbeafe", color: "#1e40af" }}>✓ Approved</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ash-600)", marginBottom: 4 }}>
                        To: {req.bankName} ****{req.accountLast4}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ash-600)" }}>
                        ≈ ₹{req.amountInr} at {req.exchangeRate} INR/USDT
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--ash-500)" }}>
                        {req.createdAt}
                      </div>
                      {req.approvedAt && (
                        <div style={{ fontSize: 10, color: "var(--ash-500)", marginTop: 2 }}>
                          Approved: {req.approvedAt}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      {entries && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
            Withdrawal History
          </div>

          {entries.length === 0 ? (
            <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, textAlign: "center" }}>
              <Icon name="arrow-right" style={{ width: 32, height: 32, color: "var(--ash-400)", margin: "0 auto 12px" }} />
              <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
                No withdrawals yet
              </div>
              <div style={{ fontSize: 12, color: "var(--ash-500)" }}>
                Your withdrawal history will appear here
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {entries.map((e, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-lg)",
                    padding: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Icon name="arrow-right" style={{ width: 16, height: 16, color: "#ef4444" }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)", textTransform: "uppercase", letterSpacing: ".02em" }}>
                          {e.kind}
                        </div>
                        <span className="badge" style={{ background: "#fee2e2", color: "#991b1b" }}>Debit</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ash-600)", marginLeft: 24, marginBottom: 4 }}>
                        {e.sub}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: "#dc2626" }}>
                        {e.amount}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)", marginTop: 2 }}>
                        {e.bal}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: "var(--ash-500)", marginLeft: 24 }}>
                    {e.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
