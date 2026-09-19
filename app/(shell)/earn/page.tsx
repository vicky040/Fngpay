import type { Metadata } from "next";
import { CommissionView } from "./CommissionView";

export const metadata: Metadata = {
  title: "Performance / Commission — Fngpay",
};

export default function EarnPage() {
  return (
    <>
      <div className="page-title-row" style={{ paddingLeft: 0, paddingRight: 0 }}>
        <div>
          <h2 className="page-title">Performance / Commission</h2>
          <div className="page-sub">Track processing commissions by type. Rates are never combined into a single percentage.</div>
        </div>
      </div>
      <CommissionView />
    </>
  );
}
