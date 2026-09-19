import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "../../components/Icon";
import { pool } from "@/lib/db";
import { requireAgent } from "@/lib/require-agent";
import { AddBankForm } from "./AddBankForm";

export const metadata: Metadata = {
  title: "Add bank account — Fngpay",
};

async function defaultBank() {
  const { rows } = await pool.query<{ name: string; short_code: string; mark: string }>(
    "SELECT name, short_code, mark FROM bank_reference WHERE short_code = 'AMCB' LIMIT 1"
  );
  const r = rows[0];
  return { name: r?.name ?? "Select a bank", short: r?.short_code ?? "", mark: r?.mark ?? "?" };
}

export default async function BankAddPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; short?: string; mark?: string }>;
}) {
  await requireAgent();
  const params = await searchParams;
  const fallback = params.name ? null : await defaultBank();
  const bank = {
    name: params.name ?? fallback!.name,
    short: params.short ?? fallback!.short,
    mark: params.mark ?? fallback!.mark,
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", maxHeight: "100vh", background: "var(--canvas)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="pv-chrome" style={{ display: "flex", alignItems: "center", gap: 8, height: 52, padding: "0 8px 0 4px", flexShrink: 0 }}>
        <Link href="/banks/select" style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
          <Icon name="chevron" strokeWidth={1.8} style={{ width: 20, height: 20, transform: "rotate(180deg)" }} />
        </Link>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Add bank account</div>
      </div>

      <AddBankForm bank={bank} />
    </div>
  );
}
