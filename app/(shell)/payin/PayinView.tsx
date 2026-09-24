"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";

type Deposit = {
  id: number;
  amountUsdt: string;
  amountInr: string;
  status: string;
  providerStatus: string;
  createdAt: string;
};

export function PayinView() {
  const [deposits, setDeposits] = useState<Deposit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/payin")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setDeposits(data.deposits);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load deposit history");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    waiting: { label: "⏳ Waiting", color: "#f59e0b", bgColor: "#fef3c7" },
    confirming: { label: "🔄 Confirming", color: "#3b82f6", bgColor: "#dbeafe" },
    confirmed: { label: "✅ Confirmed", color: "#10b981", bgColor: "#d1fae5" },
    finished: { label: "✅ Completed", color: "#10b981", bgColor: "#d1fae5" },
    failed: { label: "❌ Failed", color: "#ef4444", bgColor: "#fee2e2" },
    expired: { label: "⏱️ Expired", color: "#6b7280", bgColor: "#f3f4f6" },
  };

  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Payin Orders</h2>
          <p style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 4 }}>
            Track your deposit transactions and add more funds
          </p>
        </div>
      </div>

      {/* Add Funds Button */}
      <div style={{ marginTop: 14 }}>
        <Link
          href="/funds"
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            height: 42,
            paddingLeft: 16,
            paddingRight: 16,
          }}
        >
          <Icon name="plus" style={{ width: 16, height: 16 }} />
          Add Funds
        </Link>
      </div>

      {/* Deposit History */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)", marginBottom: 12 }}>
          Deposit History
        </div>

        {error ? (
          <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16 }}>
            <div className="field-error">{error}</div>
          </div>
        ) : deposits === null ? (
          <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Loading…</div>
        ) : deposits.length === 0 ? (
          <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, textAlign: "center" }}>
            <Icon name="plus" style={{ width: 32, height: 32, color: "var(--ash-400)", margin: "0 auto 12px" }} />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-800)", marginBottom: 4 }}>
              No deposits yet
            </div>
            <div style={{ fontSize: 12, color: "var(--ash-500)", marginBottom: 12 }}>
              Your deposit transactions will appear here once you add funds
            </div>
            <Link href="/funds" className="btn-primary" style={{ height: 38, fontSize: 13 }}>
              Make Your First Deposit
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {deposits.map((d) => {
              const statusConfig = STATUS_CONFIG[d.providerStatus] || { label: d.status, color: "var(--ash-500)", bgColor: "var(--ash-100)" };

              return (
                <div
                  key={d.id}
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
                        <Icon name="arrow-right" style={{ width: 16, height: 16, color: "var(--moss-600)", transform: "rotate(135deg)" }} />
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--moss-600)" }}>
                          +{d.amountUsdt} USDT
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--ash-600)", marginLeft: 24 }}>
                        ₹{d.amountInr} INR
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

                  <div style={{ fontSize: 11, color: "var(--ash-500)", marginLeft: 24 }}>
                    {d.createdAt}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
