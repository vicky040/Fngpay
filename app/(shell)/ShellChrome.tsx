"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Icon } from "../components/Icon";
import { NAV, TABS } from "./nav";

type ShellAgent = {
  fullName: string;
  agentCode: string;
};

type ShellWallet = {
  balanceLabel: string;
  approxInrLabel: string;
  fixedRateLabel: string;
};

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <div role="button" title="Toggle dark mode" onClick={onToggle} className="pv-theme-btn">
      <svg className="pv-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.8 6.8 0 0 0 10.8 10.8Z" />
      </svg>
      <svg className="pv-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.6v2.2M12 19.2v2.2M4.4 12H2.2M21.8 12h-2.2M6.4 6.4 4.8 4.8M19.2 19.2l-1.6-1.6M17.6 6.4l1.6-1.6M4.8 19.2l1.6-1.6" />
      </svg>
    </div>
  );
}

function SidebarContent({ agent, wallet, onNavigate }: { agent: ShellAgent; wallet: ShellWallet; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    onNavigate?.();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sb-preview" style={{ width: 288, height: "100%", overflowY: "auto" }}>
      <div className="row-brand" role={onNavigate ? "button" : undefined} onClick={onNavigate} style={onNavigate ? { cursor: "pointer" } : undefined}>
        <div className="brand-mark">PV</div>
        <div className="brand-name">Fngpay</div>
      </div>

      <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{agent.fullName}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 600, color: "var(--moss-400)", marginTop: 4 }}>{wallet.balanceLabel}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-400)", marginTop: 3 }}>≈ {wallet.approxInrLabel}</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ash-400)", marginTop: 2 }}>{wallet.fixedRateLabel}</div>
      </div>

      <div className="sec-label">Panel</div>

      {NAV.map((n) => (
        <Link key={n.label} href={n.href} className={`nav-link${pathname === n.href ? " active" : ""}`} onClick={onNavigate}>
          <Icon name={n.icon} strokeWidth={1.4} />
          {n.label}
        </Link>
      ))}

      <div style={{ marginTop: 8, borderTop: "1px solid rgba(255,255,255,.08)", paddingTop: 8 }}>
        <div role="button" className="nav-link" onClick={logout} style={{ cursor: "pointer" }}>
          <Icon name="logout" strokeWidth={1.4} />
          Logout
        </div>
      </div>

      <div className="foot">
        <div className="av">{initialsOf(agent.fullName)}</div>
        <div className="um">
          <div className="un">{agent.fullName}</div>
          <div className="ul">Partner · Agent {agent.agentCode}</div>
        </div>
      </div>
    </div>
  );
}

export function ShellChrome({ agent, wallet, children }: { agent: ShellAgent; wallet: ShellWallet; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const isDark = localStorage.getItem("pv-theme") === "dark";
      document.documentElement.classList.toggle("pv-dark", isDark);
    } catch {
      /* ignore */
    }
  }, []);

  function toggleTheme() {
    const next = !document.documentElement.classList.contains("pv-dark");
    document.documentElement.classList.toggle("pv-dark", next);
    try {
      localStorage.setItem("pv-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  const firstName = agent.fullName.trim().split(/\s+/)[0] ?? agent.fullName;

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", maxHeight: "100vh", background: "var(--canvas)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div className="pv-rail" style={{ width: 288, flexShrink: 0 }}>
          <SidebarContent agent={agent} wallet={wallet} />
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div className="pv-chrome pv-topbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 64, padding: "8px 8px 8px 4px", flexShrink: 0 }}>
            <div role="button" onClick={() => setDrawerOpen(true)} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
              <Icon name="menu" strokeWidth={1.8} style={{ width: 20, height: 20 }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, letterSpacing: ".16em", color: "#fff", textTransform: "uppercase" }}>Fngpay</div>
            <ThemeToggle onToggle={toggleTheme} />
            <div style={{ textAlign: "right", lineHeight: 1.3, paddingRight: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{firstName}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--moss-400)", letterSpacing: ".04em" }}>{wallet.balanceLabel}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--ash-400)" }}>≈ {wallet.approxInrLabel}</div>
            </div>
          </div>

          <div className="pv-content" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 16px 24px" }}>
            <div className="pv-inner">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--moss-600)", marginBottom: 6 }}>
                Partner panel
              </div>
              {children}
            </div>
          </div>

          <div className="pv-tabs" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", background: "var(--paper)", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
            {TABS.map((t) => {
              const active = t.href !== null && pathname === t.href;
              const content = (
                <>
                  <Icon name={t.icon} strokeWidth={1.8} style={{ width: 19, height: 19 }} />
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{t.label}</span>
                </>
              );
              const style: React.CSSProperties = {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                minHeight: 58,
                cursor: "pointer",
                borderTop: `2px solid ${active ? "var(--moss-500)" : "transparent"}`,
                color: active ? "var(--moss-600)" : "var(--ash-500)",
              };
              return t.href ? (
                <Link key={t.label} href={t.href} style={style}>
                  {content}
                </Link>
              ) : (
                <div key={t.label} role="button" onClick={() => setDrawerOpen(true)} style={style}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {drawerOpen ? (
        <>
          <div className="pv-drawer" onClick={() => setDrawerOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(14,42,26,.45)", backdropFilter: "blur(2px)", zIndex: 20 }} />
          <div className="pv-drawer" style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 288, zIndex: 21, display: "flex" }}>
            <SidebarContent agent={agent} wallet={wallet} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </>
      ) : null}
    </div>
  );
}
