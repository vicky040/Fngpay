import type { Metadata } from "next";
import { requireAgent } from "@/lib/require-agent";
import { BankSelectView } from "./BankSelectView";

export const metadata: Metadata = {
  title: "Select your bank — Fngpay",
};

export default async function BankSelectPage() {
  await requireAgent();
  return <BankSelectView />;
}
