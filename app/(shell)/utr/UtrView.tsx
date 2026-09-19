"use client";

import { useEffect, useState } from "react";

type UtrRecord = { utr: string; bank: string; amount: string; status: string; tone: string; date: string };

const STATUSES = ["All", "Matched", "Pending", "Unmatched"];

export function UtrView() {
  const [records, setRecords] = useState<UtrRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/utr")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setRecords(data.records);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load UTR records");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14, marginTop: 12 }}>
        <div className="form-row c1">
          <div className="field">
            <label className="field-label" htmlFor="utrSearch">
              Search
            </label>
            <input id="utrSearch" name="utrSearch" className="input mono" placeholder="UTR or bank" />
          </div>
        </div>
        <div className="form-row c1">
          <div className="field">
            <label className="field-label" htmlFor="utrStatus">
              Status
            </label>
            <select id="utrStatus" name="utrStatus" className="input" defaultValue="All">
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10 }}>
          <div className="field" style={{ maxWidth: "none" }}>
            <label className="field-label" htmlFor="utrFrom">
              From
            </label>
            <input id="utrFrom" name="utrFrom" type="date" className="input mono" />
          </div>
          <div className="field" style={{ maxWidth: "none" }}>
            <label className="field-label" htmlFor="utrTo">
              To
            </label>
            <input id="utrTo" name="utrTo" type="date" className="input mono" />
          </div>
        </div>
      </div>

      {error ? (
        <div className="field-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : records === null ? (
        <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 12 }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {records.map((u) => (
              <div key={u.utr} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 13 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-900)", wordBreak: "break-all" }}>{u.utr}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 4 }}>{u.bank}</div>
                  </div>
                  <span className={`badge badge-${u.tone}`}>{u.status}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid var(--sub-divider)",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-500)" }}>{u.date}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 600, color: "var(--ink-800)", fontVariantNumeric: "tabular-nums" }}>{u.amount}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--ash-500)", marginTop: 12 }}>
            {records.length === 0 ? "No UTR entries yet." : "Demo UTR data for UI preview only."}
          </div>
        </>
      )}
    </>
  );
}
