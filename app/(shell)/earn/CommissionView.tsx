"use client";

import { useEffect, useState } from "react";

type Rate = { label: string; value: string; note: string };
type Metric = { label: string; value: string };
type WeekDay = { day: string; payin: string; payout: string; agent: string };

export function CommissionView() {
  const [fixedRateLabel, setFixedRateLabel] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[] | null>(null);
  const [metrics, setMetrics] = useState<Metric[] | null>(null);
  const [week, setWeek] = useState<WeekDay[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/commission")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setFixedRateLabel(data.fixedRateLabel);
          setRates(data.rates);
          setMetrics(data.metrics);
          setWeek(data.week);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load commission data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="field-error" style={{ marginTop: 12 }}>{error}</div>;
  if (!rates || !metrics || !week || !fixedRateLabel) {
    return <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>;
  }

  return (
    <>
      <div style={{ background: "var(--moss-50)", border: "1px solid var(--moss-100)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--moss-600)" }}>
          Fixed settlement rate
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 600, color: "var(--ink-900)", marginTop: 8 }}>{fixedRateLabel}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-700)", marginTop: 6 }}>USDT rate is fixed on all settlements.</div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ash-500)", margin: "20px 0 10px" }}>
        Commission rates
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rates.map((r) => (
          <div key={r.label} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ash-500)" }}>{r.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: "var(--moss-600)", marginTop: 6 }}>{r.value}</div>
            <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 4 }}>{r.note}</div>
          </div>
        ))}
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ash-500)", margin: "20px 0 10px" }}>
        Period metrics
      </div>
      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "13px 14px", borderBottom: "1px solid var(--sub-divider)" }}>
            <div style={{ fontSize: 13, color: "var(--ash-700)" }}>{m.label}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--ink-800)", fontVariantNumeric: "tabular-nums" }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 16, marginTop: 16 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>Weekly breakdown (demo)</div>
        <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 4 }}>Relative volumes for payin, payout, and agent commission.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, alignItems: "end", height: 150, marginTop: 18 }}>
          {week.map((d) => (
            <div key={d.day} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: "100%" }}>
                <div style={{ width: 10, borderRadius: "2px 2px 0 0", background: "var(--moss-500)", height: d.payin }} />
                <div style={{ width: 10, borderRadius: "2px 2px 0 0", background: "var(--ink-700)", height: d.payout }} />
                <div style={{ width: 10, borderRadius: "2px 2px 0 0", background: "var(--ash-300)", height: d.agent }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-500)" }}>{d.day}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--sub-divider)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ash-700)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--moss-500)" }} />
            Payin
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ash-700)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ink-700)" }} />
            Payout
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ash-700)" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ash-300)" }} />
            Agent
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
        <div style={{ fontSize: 12, color: "var(--ash-500)" }}>Commercial terms and eligibility may vary based on the applicable agreement and account configuration.</div>
        <div style={{ fontSize: 12, color: "var(--ash-500)" }}>Metric figures are demo placeholders for UI preview.</div>
      </div>
    </>
  );
}
