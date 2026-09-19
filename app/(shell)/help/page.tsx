import type { Metadata } from "next";
import { FaqAccordion } from "./FaqAccordion";
import { TicketForm } from "./TicketForm";

export const metadata: Metadata = {
  title: "Help — Fngpay",
};

function Card({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 14 }}>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: "var(--ink-900)" }}>{title}</div>
      <div style={{ fontSize: 12.5, color: "var(--ash-600)", marginTop: 3 }}>{subtitle}</div>
      {children}
    </div>
  );
}

export default function HelpPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Help</h2>
          <div className="page-sub">FAQs, support channels, and ticket submission.</div>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ash-500)", margin: "16px 0 8px" }}>
        FAQ
      </div>
      <FaqAccordion />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
        <Card title="Contact Support" subtitle="Reach the operations team or the FNGPAY bot using the channels below.">
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "var(--ash-500)" }}>Official Telegram</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--moss-600)", marginTop: 2 }}>@Payvoraofficial</div>
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "var(--ash-500)" }}>FNGPAY Telegram Bot</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--moss-600)", marginTop: 2 }}>@payvorap2p_bot</div>
          </div>
        </Card>

        <Card title="Telegram Support" subtitle="Message official FNGPAY support for onboarding, commission, referral and operational help.">
          <div style={{ marginTop: 12 }}>
            <a href="https://t.me/Payvoraofficial" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }}>
              Open Telegram
            </a>
          </div>
        </Card>

        <Card
          title="FNGPAY Telegram Bot"
          subtitle="Get instant answers on working process, commission, referral, panel access, and more — available in English and Hinglish."
        >
          <div style={{ marginTop: 12 }}>
            <a href="https://t.me/payvorap2p_bot" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }}>
              Open Telegram Bot
            </a>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14 }}>
        <TicketForm />
      </div>
    </>
  );
}
