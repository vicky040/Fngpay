import type { Metadata } from "next";
import { FundsView } from "./FundsView";

export const metadata: Metadata = {
  title: "Add funds — Fngpay",
};

export default function FundsPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Add funds</h2>
          <div className="page-sub">Deposit USDT on TRON (TRC20). Credits settle at the fixed rate shown below.</div>
        </div>
      </div>
      <FundsView />
    </>
  );
}
