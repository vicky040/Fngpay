"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";
import { EmptyState } from "../../components/EmptyState";

type Order = { amount: string; status: string; date: string };
type Wallet = { balanceLabel: string; approxInrLabel: string; fixedRateLabel: string };

export function PayoutView() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payout")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setWallet(data.wallet);
          setOrders(data.orders);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load payout orders");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="field-error" style={{ marginTop: 14 }}>{error}</div>;
  if (!wallet || !orders) return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 14 }}>Loading…</div>;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          background: "var(--moss-50)",
          border: "1px solid var(--moss-100)",
          borderRadius: "var(--r-lg)",
          padding: 14,
          marginTop: 14,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: "var(--r-md)",
            background: "var(--paper)",
            border: "1px solid var(--moss-100)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--moss-600)",
          }}
        >
          <Icon name="budget" strokeWidth={1.8} style={{ width: 16, height: 16 }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--moss-600)" }}>
            Available balance
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 600, color: "var(--ink-900)", marginTop: 6 }}>{wallet.balanceLabel}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ash-600)", marginTop: 4 }}>≈ {wallet.approxInrLabel}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)", marginTop: 2 }}>{wallet.fixedRateLabel}</div>
        </div>
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", marginTop: 12, padding: orders.length ? 0 : "4px 0" }}>
        {orders.length === 0 ? (
          <EmptyState
            icon="arrow-right"
            title="No payout orders yet"
            subtitle="Outgoing payouts will appear here with amount, method, and status once payout processing is live on your panel."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {orders.map((o, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: 14, borderBottom: i < orders.length - 1 ? "1px solid var(--sub-divider)" : undefined }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)" }}>{o.amount}</div>
                  <div style={{ fontSize: 12, color: "var(--ash-500)", marginTop: 2 }}>{o.date}</div>
                </div>
                <span className="badge badge-green">{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
