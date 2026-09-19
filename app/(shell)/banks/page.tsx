import type { Metadata } from "next";
import { BanksView } from "./BanksView";

export const metadata: Metadata = {
  title: "Banks & UPI — Fngpay",
};

export default function BanksPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Banks &amp; UPI</h2>
          <div className="page-sub">Manage settlement banks and request business UPI apps from one place.</div>
        </div>
      </div>
      <BanksView />
    </>
  );
}
