"use client";

import { useEffect, useState } from "react";
import { Icon } from "../../components/Icon";

type Faq = { question: string; answer: string };

export function FaqAccordion() {
  const [faqs, setFaqs] = useState<Faq[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(-1);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/faqs")
      .then((res) => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setFaqs(data.faqs);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load FAQs");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <div className="field-error">{error}</div>;
  if (!faqs) return <div style={{ fontSize: 13, color: "var(--ash-500)" }}>Loading…</div>;

  return (
    <div style={{ background: "var(--paper)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
      {faqs.map((f, i) => (
        <div key={f.question} style={{ borderBottom: "1px solid var(--sub-divider)" }}>
          <div
            role="button"
            onClick={() => setOpen(open === i ? -1 : i)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", cursor: "pointer" }}
          >
            <div style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: "var(--ink-900)" }}>{f.question}</div>
            <span style={{ color: "var(--ash-500)", display: "flex", flexShrink: 0 }}>
              <Icon name="chevron" strokeWidth={1.8} style={{ width: 16, height: 16, transform: open === i ? "rotate(-90deg)" : "rotate(90deg)" }} />
            </span>
          </div>
          {open === i ? <div style={{ padding: "0 14px 14px", fontSize: 12.5, color: "var(--ash-700)", lineHeight: 1.6 }}>{f.answer}</div> : null}
        </div>
      ))}
    </div>
  );
}
