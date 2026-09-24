"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "../components/Icon";

type Stat = { label: string; value: string };
type Entry = { kind: string; sub: string; amount: string; day: string };

const QUICK_ACTIONS: { label: string; icon: IconName; href: string | null }[] = [
  { label: "Banks", icon: "budget", href: "/banks" },
  { label: "History", icon: "clock", href: "/history" },
  { label: "Add funds", icon: "plus", href: "/funds" },
  { label: "Refer", icon: "client", href: "/refer" },
  { label: "Support", icon: "info", href: "/help" },
];

export function HomeView() {
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/home")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setStats(data.stats);
          setEntries(data.entries);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load home data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Home</h2>
        </div>
      </div>

      {error ? (
        <div className="field-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      ) : !stats || !entries ? (
        <div style={{ fontSize: 13, color: "var(--ash-500)", marginTop: 16 }}>Loading…</div>
      ) : (
        <>
          <div className="pv-stats" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 10, marginTop: 12 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "12px 13px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ash-500)" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 600, color: "var(--ink-800)", marginTop: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 22 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)" }}>Recent activity</div>
              <div style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 2 }}>Latest wallet credits and adjustments</div>
            </div>
            <Link href="/history" style={{ fontSize: 13, fontWeight: 500, color: "var(--moss-600)", whiteSpace: "nowrap" }}>
              View all
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {entries.length === 0 ? (
              <div style={{ fontSize: 13, color: "var(--ash-500)" }}>No wallet activity yet.</div>
            ) : (
              entries.map((e) => (
                <div key={e.sub} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      flexShrink: 0,
                      borderRadius: "var(--r-md)",
                      background: "var(--moss-50)",
                      border: "1px solid var(--moss-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--moss-600)",
                    }}
                  >
                    <Icon name="arrow-right" strokeWidth={1.8} style={{ width: 16, height: 16, transform: "rotate(135deg)" }} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)", textTransform: "uppercase", letterSpacing: ".02em" }}>{e.kind}</span>
                      <span className="badge badge-green">Credit</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ash-600)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.sub}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, whiteSpace: "nowrap" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "var(--moss-600)" }}>{e.amount}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-500)", marginTop: 3 }}>{e.day}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: 22 }}>
        <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink-900)" }}>Quick actions</div>
        <div style={{ fontSize: 13, color: "var(--ash-600)", marginTop: 2 }}>Jump to the most-used panel tools</div>
      </div>
      <div className="pv-quick" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 12 }}>
        {QUICK_ACTIONS.map((q) => {
          const tileStyle: React.CSSProperties = {
            background: "var(--paper)",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-lg)",
            padding: "14px 8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            minHeight: 78,
            justifyContent: "center",
          };
          const inner = (
            <>
              <span style={{ color: "var(--ink-700)", display: "flex" }}>
                <Icon name={q.icon} strokeWidth={1.7} style={{ width: 19, height: 19 }} />
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink-800)" }}>{q.label}</span>
            </>
          );
          return q.href ? (
            <Link key={q.label} href={q.href} style={{ ...tileStyle, cursor: "pointer" }}>
              {inner}
            </Link>
          ) : (
            <div key={q.label} style={tileStyle}>
              {inner}
            </div>
          );
        })}
      </div>
    </>
  );
}
