"use client";

import { useEffect, useState } from "react";

type ReportRow = { period: string; deposits: string; withdrawals: string; commission: string; net: string };
type Reports = { Daily: ReportRow[]; Weekly: ReportRow[]; Monthly: ReportRow[] };

const TABS = ["Daily", "Weekly", "Monthly"] as const;

export function ReportsView() {
  const [reports, setReports] = useState<Reports | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<(typeof TABS)[number]>("Daily");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reports")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setReports(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load reports");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div style={{ margin: "12px 0 0" }}>
        <div className="type-tabs">
          {TABS.map((label) => (
            <button key={label} type="button" className={`type-tab${label === period ? " active" : ""}`} onClick={() => setPeriod(label)}>
              <span className="tab-dot dot-all" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <input className="input" placeholder="Filter by period" style={{ maxWidth: "none" }} />
      </div>

      {error ? (
        <div className="field-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : reports === null ? (
        <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 12 }}>Loading…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
          {reports[period].map((r) => (
            <div key={r.period} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 13 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-900)" }}>{r.period}</div>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginTop: 12 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ash-500)" }}>Deposits</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink-800)", marginTop: 4 }}>{r.deposits}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ash-500)" }}>Withdrawals</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink-800)", marginTop: 4 }}>{r.withdrawals}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ash-500)" }}>Commission</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink-800)", marginTop: 4 }}>{r.commission}</div>
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ash-500)" }}>Net</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--moss-600)", marginTop: 4 }}>{r.net}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--ash-500)", marginTop: 12 }}>Demo report aggregates for UI preview only.</div>
    </>
  );
}
