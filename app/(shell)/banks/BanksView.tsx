"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "../../components/Icon";
import { EmptyState } from "../../components/EmptyState";

type LinkedBank = { name: string; short: string; last4: string };
type Provider = { name: string; mark: string; locked: boolean };

export function BanksView() {
  const [linkedBanks, setLinkedBanks] = useState<LinkedBank[] | null>(null);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banks")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setLinkedBanks(data.linkedBanks);
          setProviders(data.upiProviders);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load banks");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div style={{ marginTop: 12 }}>
        <div className="card">
          <div className="card-head-icon">
            <div className="card-icon-tile">
              <Icon name="budget" />
            </div>
            <div>
              <div className="card-head-title">Settlement banks</div>
              <div className="card-head-sub">Link verified bank accounts for INR settlement. Official logos help you pick the right rail quickly.</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Link href="/banks/select" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }}>
                Add bank
              </Link>

              {error ? (
                <div className="field-error">{error}</div>
              ) : linkedBanks === null ? (
                <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Loading…</div>
              ) : linkedBanks.length === 0 ? (
                <div style={{ border: "1px dashed var(--border-strong)", borderRadius: "var(--r-lg)", background: "var(--canvas)", padding: "4px 0 18px" }}>
                  <EmptyState icon="budget" title="No banks linked" subtitle="Add a settlement bank once your account is active to start INR operations." />
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Link href="/banks/select" className="btn-secondary" style={{ height: 44, padding: "0 20px" }}>
                      Add bank
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {linkedBanks.map((b) => (
                    <div key={b.name + b.last4} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 12 }}>
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
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--ink-700)",
                        }}
                      >
                        {b.short.slice(0, 2).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)" }}>{b.name}</div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-500)", marginTop: 2 }}>••••{b.last4}</div>
                      </div>
                      <span className="badge badge-green">Active</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <div className="card">
          <div className="card-head-icon">
            <div className="card-icon-tile blue">
              <Icon name="apps" />
            </div>
            <div>
              <div className="card-head-title">UPI apps</div>
              <div className="card-head-sub">Business UPI providers stay locked until your security deposit is complete and activation is confirmed.</div>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {providers === null && !error ? (
                <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Loading…</div>
              ) : (
                (providers ?? []).map((p) => (
                  <div key={p.name} style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          flexShrink: 0,
                          borderRadius: "var(--r-md)",
                          background: "var(--canvas)",
                          border: "1px solid var(--border)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink-700)",
                        }}
                      >
                        {p.mark}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink-900)" }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <span className="badge badge-neutral">UPI</span>
                          {p.locked ? <span className="badge badge-amber">Locked</span> : <span className="badge badge-green">Active</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 10 }}>
                      {p.locked ? "Deposit recorded. Provider activation is in progress with the operations team." : "Ready to use."}
                    </div>
                    {p.locked ? (
                      <div style={{ marginTop: 12 }}>
                        <button type="button" className="btn-secondary" style={{ width: "100%", height: 44, fontSize: 14 }}>
                          Request access
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
