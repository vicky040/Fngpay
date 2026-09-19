"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";
import { EmptyState } from "../../components/EmptyState";

type Bank = { name: string; short: string; mark: string };

export function BankSelectView() {
  const [banks, setBanks] = useState<Bank[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banks/reference")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setBanks(data.banks);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load bank list");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const results = banks === null ? [] : q ? banks.filter((b) => (b.name + " " + b.short).toLowerCase().includes(q)) : banks;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", maxHeight: "100vh", background: "var(--canvas)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="pv-chrome" style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", flexShrink: 0 }}>
        <Link href="/banks" style={{ width: 32, height: 32, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
          <Icon name="close" strokeWidth={1.8} style={{ width: 20, height: 20 }} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Select your bank</div>
          <div style={{ fontSize: 11.5, color: "var(--ash-400)", marginTop: 2 }}>Official bank logos · secure settlement account</div>
        </div>
        <span style={{ color: "var(--moss-400)", display: "flex", paddingTop: 4 }}>
          <Icon name="check" strokeWidth={1.8} style={{ width: 16, height: 16 }} />
        </span>
      </div>

      <div className="pv-chrome" style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,.08)", flexShrink: 0 }}>
        <div className="search-wrap" style={{ width: "100%" }}>
          <Icon name="search" strokeWidth={1.5} />
          <input
            type="text"
            className="search-input"
            style={{ width: "100%" }}
            placeholder="Search by bank name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", background: "var(--canvas)" }}>
        {error ? (
          <div className="field-error" style={{ padding: 14 }}>
            {error}
          </div>
        ) : banks === null ? (
          <div style={{ fontSize: 13, color: "var(--ash-500)", padding: 14 }}>Loading…</div>
        ) : (
          <>
            {results.map((b) => (
              <Link
                key={b.short}
                href={`/banks/add?name=${encodeURIComponent(b.name)}&short=${encodeURIComponent(b.short)}&mark=${encodeURIComponent(b.mark)}`}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderBottom: "1px solid var(--sub-divider)", cursor: "pointer", background: "var(--paper)" }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    flexShrink: 0,
                    borderRadius: "var(--r-md)",
                    background: "var(--canvas)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: "var(--ink-700)",
                  }}
                >
                  {b.mark}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)" }}>{b.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-500)", marginTop: 2 }}>{b.short}</div>
                </div>
                <span style={{ color: "var(--ash-400)", display: "flex" }}>
                  <Icon name="chevron" strokeWidth={1.8} style={{ width: 16, height: 16 }} />
                </span>
              </Link>
            ))}
            {results.length === 0 ? <EmptyState icon="search" title="No banks found" subtitle="Try a different bank name or short code." /> : null}
          </>
        )}
      </div>
    </div>
  );
}
