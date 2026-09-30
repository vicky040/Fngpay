import { requireAdmin } from "@/lib/require-admin";
import { ShellChrome } from "./ShellChrome";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  // Admin-only layout - no wallet needed
  const admin = await requireAdmin();

  // Admin panel doesn't need wallet balance
  const wallet = {
    balanceLabel: "Admin",
    approxInrLabel: "Dashboard",
    fixedRateLabel: "FNGPay Admin Panel",
  };

  return (
    <ShellChrome agent={{ fullName: admin.fullName, agentCode: admin.agentCode }} wallet={wallet}>
      {children}
    </ShellChrome>
  );
}
