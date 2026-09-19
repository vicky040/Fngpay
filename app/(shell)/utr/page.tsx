import type { Metadata } from "next";
import { UtrView } from "./UtrView";

export const metadata: Metadata = {
  title: "UTR — Fngpay",
};

export default function UtrPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">UTR</h2>
          <div className="page-sub">Search and filter UTR references for deposit matching.</div>
        </div>
      </div>
      <UtrView />
    </>
  );
}
