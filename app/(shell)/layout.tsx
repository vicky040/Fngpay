import { requireAgent } from "@/lib/require-agent";
import { pool } from "@/lib/db";
import { formatInr, formatUsdt } from "@/lib/format";
import { ShellChrome } from "./ShellChrome";

export default async function ShellLayout({ children }: { children: React.ReactNode }) {
  const agent = await requireAgent();

  const { rows } = await pool.query<{ balance_usdt: string; fixed_rate_inr: string }>(
    "SELECT balance_usdt, fixed_rate_inr FROM wallets WHERE agent_id = $1",
    [agent.id]
  );
  const balance = Number(rows[0]?.balance_usdt ?? 0);
  const rate = Number(rows[0]?.fixed_rate_inr ?? 0);

  const wallet = {
    balanceLabel: formatUsdt(balance),
    approxInrLabel: formatInr(balance * rate),
    fixedRateLabel: `Fixed rate: ${formatInr(rate)} / USDT`,
  };

  return (
    <ShellChrome agent={{ fullName: agent.fullName, agentCode: agent.agentCode }} wallet={wallet}>
      {children}
    </ShellChrome>
  );
}
