import type { Metadata } from "next";
import { ReportsView } from "./ReportsView";

export const metadata: Metadata = {
  title: "Reports — Fngpay",
};

export default function ReportsPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Reports</h2>
          <div className="page-sub">Daily, weekly, and monthly operational summaries.</div>
        </div>
      </div>
      <ReportsView />
    </>
  );
}
