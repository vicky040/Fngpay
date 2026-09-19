import type { Metadata } from "next";
import { PayoutView } from "./PayoutView";

export const metadata: Metadata = {
  title: "Payout orders — Fngpay",
};

export default function PayoutPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Payout orders</h2>
          <div className="page-sub">Review outgoing payouts against your available wallet balance.</div>
        </div>
      </div>
      <PayoutView />
    </>
  );
}
