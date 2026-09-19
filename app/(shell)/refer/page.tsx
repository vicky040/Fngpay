import type { Metadata } from "next";
import { ReferView } from "./ReferView";

export const metadata: Metadata = {
  title: "Refer & Earn — Fngpay",
};

export default function ReferPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Refer &amp; Earn</h2>
          <div className="page-sub">
            Grow your network. Earn referral and agentship commission on the daily turnover of traders you bring to FNGPAY.
          </div>
        </div>
      </div>
      <ReferView />
    </>
  );
}
