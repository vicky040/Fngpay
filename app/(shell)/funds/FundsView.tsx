"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "../../components/Icon";

type FundsData = {
  fixedRateLabel: string;
  securityDepositCompleted: boolean;
  depositsConfigured: boolean;
  activeSession: { id: number; payAddress: string; payAmount: string; priceAmount: string; providerStatus: string } | null;
};

type SessionDetail = {
  pay_address: string;
  pay_amount: string;
  pay_currency: string;
  price_amount: string;
  price_currency: string;
  provider_status: string;
  status: string;
  qrDataUri: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting for payment",
  confirming: "Confirming on-chain",
  confirmed: "Confirmed",
  sending: "Sending",
  partially_paid: "Partially paid",
  finished: "Completed",
  failed: "Failed",
  refunded: "Refunded",
  expired: "Expired",
};

export function FundsView() {
  const [data, setData] = useState<FundsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"idle" | "form">("idle");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/funds")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((d: FundsData) => {
        if (cancelled) return;
        setData(d);
        if (d.activeSession) setSessionId(d.activeSession.id);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load deposit info");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (sessionId == null) return;
    let cancelled = false;

    const poll = () => {
      fetch(`/api/funds/deposit/${sessionId}`)
        .then((res) => {
          if (!res.ok) throw new Error(`API returned ${res.status}`);
          return res.json();
        })
        .then((d: SessionDetail) => {
          if (cancelled) return;
          setSession(d);
          if (d.status !== "active" && pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        })
        .catch(() => {});
    };

    poll();
    pollRef.current = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [sessionId]);

  async function submitAmount(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const amountInr = Number(amount);

    // Minimum deposit: 500 USDT (at 104 INR/USDT = ₹52,000)
    const MIN_DEPOSIT_INR = 52000;

    if (!Number.isFinite(amountInr) || amountInr < MIN_DEPOSIT_INR) {
      setFormError(`Minimum deposit is ₹${MIN_DEPOSIT_INR.toLocaleString('en-IN')} (500 USDT at 104 INR/USDT).`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/funds/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr }),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Couldn't start a deposit.");
        return;
      }
      setSession({
        pay_address: body.payAddress,
        pay_amount: body.payAmount,
        pay_currency: body.payCurrency,
        price_amount: body.priceAmount,
        price_currency: body.priceCurrency,
        provider_status: body.status,
        status: "active",
        qrDataUri: body.qrDataUri,
      });
      setSessionId(body.sessionId);
      setView("idle");
    } catch {
      setFormError("Couldn't start a deposit — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startNewDeposit() {
    setAmount("");
    setFormError(null);
    setSession(null);
    setSessionId(null);
    setView("form");
  }

  async function paySecurityDeposit() {
    setFormError(null);
    setSubmitting(true);

    // 2,000 USDT at 104 INR/USDT = ₹2,08,000
    const securityDepositInr = 208000;

    try {
      const res = await fetch("/api/funds/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountInr: securityDepositInr, isSecurityDeposit: true }),
      });
      const body = await res.json();
      if (!res.ok) {
        setFormError(body.error ?? "Couldn't start security deposit payment.");
        return;
      }
      setSession({
        pay_address: body.payAddress,
        pay_amount: body.payAmount,
        pay_currency: body.payCurrency,
        price_amount: body.priceAmount,
        price_currency: body.priceCurrency,
        provider_status: body.status,
        status: "active",
        qrDataUri: body.qrDataUri,
      });
      setSessionId(body.sessionId);
      setView("idle");
    } catch {
      setFormError("Couldn't start security deposit payment — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <div className="field-error" style={{ marginTop: 12 }}>{error}</div>;
  if (!data) return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>;

  return (
    <>
      <div style={{ background: "var(--moss-50)", border: "1px solid var(--moss-100)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--moss-600)" }}>
          Fixed USDT rate
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--ink-900)", marginTop: 6 }}>{data.fixedRateLabel}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-700)", marginTop: 6 }}>USDT rate is fixed on all settlements.</div>
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>Deposit USDT</div>
        <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 3 }}>
          Pay in INR and receive a TRC20 USDT address. Sessions stay valid for 20 minutes.
        </div>
        {formError && view === "idle" ? <div className="field-error" style={{ marginTop: 10 }}>{formError}</div> : null}
      </div>

      {!data.depositsConfigured ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)" }}>Deposits aren&apos;t set up yet</div>
          <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 4 }}>
            The payment gateway needs an API key before deposits can be created. Ask your admin to finish the NOWPayments setup.
          </div>
        </div>
      ) : view === "form" ? (
        <form
          onSubmit={submitAmount}
          style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}
        >
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)" }}>Enter amount (INR)</div>
          <input
            type="number"
            min={52000}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Minimum ₹52,000 (500 USDT)"
            style={{
              marginTop: 10,
              width: "100%",
              height: 42,
              borderRadius: "var(--r-md)",
              border: "1px solid var(--border)",
              padding: "0 12px",
              fontSize: 14,
            }}
          />
          {formError ? <div className="field-error" style={{ marginTop: 8 }}>{formError}</div> : null}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1, height: 42 }} onClick={() => setView("idle")}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1, height: 42 }} disabled={submitting}>
              {submitting ? "Creating…" : "Get address"}
            </button>
          </div>
        </form>
      ) : session ? (
        <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>Deposit session</div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: session.status === "completed" ? "var(--moss-600)" : session.status === "failed" ? "#b3441c" : "var(--ash-600)",
              }}
            >
              {STATUS_LABELS[session.provider_status] ?? session.provider_status}
            </div>
          </div>

          {session.status === "completed" ? (
            <div style={{ fontSize: 12.5, color: "var(--moss-600)", marginTop: 6 }}>Received — your wallet balance has been updated.</div>
          ) : session.status === "failed" ? (
            <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 6 }}>This session didn&apos;t complete. Start a new deposit below.</div>
          ) : (
            <>
              {session.qrDataUri ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data: URI, next/image can't optimize it */}
                  <img
                    src={session.qrDataUri}
                    alt="Deposit address QR code"
                    width={180}
                    height={180}
                    style={{ borderRadius: "var(--r-md)", border: "1px solid var(--border)" }}
                  />
                </div>
              ) : null}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ash-500)" }}>Send exactly</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--ink-900)", marginTop: 2 }}>
                  {session.pay_amount} USDT
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--ash-500)" }}>TRC20 address</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--ink-800)", marginTop: 2, wordBreak: "break-all" }}>
                  {session.pay_address}
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ash-500)", marginTop: 10 }}>
                Waiting for payment — this updates automatically once we detect it on-chain.
              </div>
            </>
          )}

          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn-secondary" style={{ width: "100%", height: 42 }} onClick={startNewDeposit}>
              {session.status === "active" ? "Start a different deposit" : "New deposit"}
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10, marginTop: 12 }}>
        <button
          type="button"
          onClick={() => !data.securityDepositCompleted && data.depositsConfigured && paySecurityDeposit()}
          disabled={data.securityDepositCompleted || !data.depositsConfigured || submitting}
          style={{
            background: data.securityDepositCompleted ? "var(--canvas)" : "var(--paper)",
            border: data.securityDepositCompleted ? "1px solid var(--border)" : "1px solid var(--moss-500)",
            borderRadius: "var(--r-lg)",
            padding: 13,
            textAlign: "left",
            cursor: !data.securityDepositCompleted && data.depositsConfigured && !submitting ? "pointer" : "default",
            opacity: !data.depositsConfigured ? 0.6 : 1,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--r-md)",
              background: data.securityDepositCompleted ? "var(--paper)" : "var(--moss-50)",
              border: data.securityDepositCompleted ? "1px solid var(--border)" : "1px solid var(--moss-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: data.securityDepositCompleted ? "var(--ash-500)" : "var(--moss-600)",
            }}
          >
            <Icon name="info" style={{ width: 16, height: 16 }} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)", marginTop: 10 }}>Security Deposit</div>
          <div style={{ fontSize: 12, color: "var(--ash-600)", marginTop: 4 }}>One-time 2,000 USDT</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: data.securityDepositCompleted ? "var(--ash-500)" : "var(--moss-600)", marginTop: 8 }}>
            {data.securityDepositCompleted ? "✅ Completed" : submitting ? "Processing..." : "Pay Now →"}
          </div>
        </button>
        <button
          type="button"
          onClick={() => data.securityDepositCompleted && data.depositsConfigured && setView("form")}
          disabled={!data.securityDepositCompleted || !data.depositsConfigured || view === "form"}
          style={{
            background: "var(--paper)",
            border: data.securityDepositCompleted ? "1px solid var(--moss-500)" : "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: 13,
            textAlign: "left",
            cursor: data.securityDepositCompleted && data.depositsConfigured && view !== "form" ? "pointer" : "default",
            opacity: data.securityDepositCompleted && data.depositsConfigured ? 1 : 0.6,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--r-md)",
              background: "var(--moss-50)",
              border: "1px solid var(--moss-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--moss-600)",
            }}
          >
            <Icon name="budget" style={{ width: 16, height: 16 }} />
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)", marginTop: 10 }}>Add Funds</div>
          <div style={{ fontSize: 12, color: "var(--ash-600)", marginTop: 4 }}>
            {data.securityDepositCompleted ? "Top up wallet (Min. 500 USDT)" : "Complete security deposit first"}
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: data.securityDepositCompleted ? "var(--moss-600)" : "var(--ash-500)", marginTop: 8 }}>
            {data.securityDepositCompleted ? (session ? "Start another →" : "Select →") : "Locked"}
          </div>
        </button>
      </div>
    </>
  );
}
