import type { Metadata } from "next";
import { PayinView } from "./PayinView";

export const metadata: Metadata = {
  title: "Payin orders — Fngpay",
};

export default function PayinPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Payin orders</h2>
          <div className="page-sub">Track incoming payin orders as they appear on your panel.</div>
        </div>
      </div>
      <PayinView />
    </>
  );
}
