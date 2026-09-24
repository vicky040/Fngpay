import type { Metadata } from "next";
import { PayoutView } from "./PayoutView";

export const metadata: Metadata = {
  title: "Payout orders — Fngpay",
};

export default function PayoutPage() {
  return <PayoutView />;
}
