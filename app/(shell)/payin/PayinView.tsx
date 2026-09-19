"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";

type Order = { amount: string; status: string; date: string };

export function PayinView() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payin")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setOrders(data.orders);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load payin orders");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", marginTop: 14, padding: orders?.length ? 0 : "4px 0" }}>
      {error ? (
        <div className="field-error" style={{ padding: 14 }}>
          {error}
        </div>
      ) : orders === null ? (
        <div style={{ fontSize: 13, color: "var(--ash-500)", padding: 14 }}>Loading…</div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon="arrow-right"
          title="No payin orders yet"
          subtitle="When payin volume starts flowing to your panel, live orders will list here with status and amount."
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
  );
}
