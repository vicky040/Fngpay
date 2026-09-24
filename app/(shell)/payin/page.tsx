import type { Metadata } from "next";
import { PayinView } from "./PayinView";

export const metadata: Metadata = {
  title: "Payin orders — Fngpay",
};

export default function PayinPage() {
  return <PayinView />;
}
