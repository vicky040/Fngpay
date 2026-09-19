"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";

type Entry = {
  kind: string;
  type: string;
  sub: string;
  date: string;
  amount: string;
  bal: string;
};

const TABS = ["All", "Deposits", "Withdrawals", "Adjustments"];

export function HistoryView() {
  const [filter, setFilter] = useState("All");
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [balanceLabel, setBalanceLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/history")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setEntries(data.entries);
          setBalanceLabel(data.balanceLabel);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load history");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const ledger = entries === null ? [] : filter === "All" ? entries : entries.filter((e) => e.type === filter);

  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">History</h2>
          <div className="page-sub">Wallet ledger{balanceLabel ? ` · available balance ${balanceLabel}` : ""}</div>
        </div>
      </div>

      <div className="type-tabs" style={{ marginTop: 12 }}>
        {TABS.map((label) => (
          <button
            key={label}
            type="button"
            className={`type-tab${label === filter ? " active" : ""}`}
            onClick={() => setFilter(label)}
          >
            <span className="tab-dot dot-all" />
            {label}
          </button>
        ))}
      </div>

      {error ? (
        <div style={{ marginTop: 16 }}>
          <EmptyState icon="info" title="Couldn't load history" subtitle={`${error} — is the Postgres container running? (docker compose up)`} />
        </div>
      ) : entries === null ? (
        <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
            {ledger.map((e) => (
              <div key={e.sub} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-900)", textTransform: "uppercase", letterSpacing: ".02em" }}>{e.kind}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.sub}</div>
                  </div>
                  <span className="badge badge-green">Completed</span>
                </div>
                <div style={{ height: 1, background: "var(--sub-divider)", margin: "12px 0" }} />
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)", whiteSpace: "nowrap" }}>{e.date}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 16, fontWeight: 600, color: "var(--moss-600)" }}>{e.amount}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-500)", marginTop: 2 }}>{e.bal}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {ledger.length === 0 ? (
            <div style={{ marginTop: 4 }}>
              <EmptyState icon="clock" title="No entries yet" subtitle="No wallet entries in this filter yet." />
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
