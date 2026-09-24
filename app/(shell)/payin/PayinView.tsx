"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";

type HistoryEntry = {
  kind: string;
  type: string;
  sub: string;
  date: string;
  amount: string;
  bal: string;
};

export function PayinView() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/history?filter=deposits")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setEntries(data.entries);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load deposits");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        ) : entries === null ? (
          <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Loading…</div>
        ) : entries.length === 0 ? (
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
                      <Icon name="arrow-right" style={{ width: 16, height: 16, color: "var(--moss-600)", transform: "rotate(135deg)" }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)", textTransform: "uppercase", letterSpacing: ".02em" }}>
                        {e.kind}
                      </div>
                      <span className="badge badge-green">Credit</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ash-600)", marginLeft: 24, marginBottom: 4 }}>
                      {e.sub}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: "var(--moss-600)" }}>
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
    </>
  );
}
