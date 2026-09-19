import { pool } from "./db";
import { CREDITABLE_STATUSES, TERMINAL_FAILURE_STATUSES } from "./nowpayments";

// Shared by both the IPN webhook (primary path) and the manual status-check
// route (fallback for when a webhook never arrives, e.g. local dev without a
// public URL). credited_at being set is what makes this safe to call twice
// for the same payment — a webhook retry or a poll landing right after it
// can never double-credit the wallet.
export async function applyProviderStatus(sessionId: number, providerStatus: string, actuallyPaid?: number | string | null) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT agent_id, pay_amount, credited_at, status FROM deposit_sessions WHERE id = $1 FOR UPDATE",
      [sessionId]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return;
    }
    const session = rows[0];

    let status = session.status;
    if (CREDITABLE_STATUSES.has(providerStatus)) status = "completed";
    else if (TERMINAL_FAILURE_STATUSES.has(providerStatus)) status = "failed";

    await client.query("UPDATE deposit_sessions SET provider_status = $1, status = $2, updated_at = now() WHERE id = $3", [
      providerStatus,
      status,
      sessionId,
    ]);

    if (CREDITABLE_STATUSES.has(providerStatus) && !session.credited_at) {
      const creditedAmount = Number(actuallyPaid ?? session.pay_amount ?? 0);
      await client.query("UPDATE deposit_sessions SET credited_at = now() WHERE id = $1", [sessionId]);
      await client.query("UPDATE wallets SET balance_usdt = balance_usdt + $1 WHERE agent_id = $2", [
        creditedAmount,
        session.agent_id,
      ]);

      const { rows: walletRows } = await client.query("SELECT balance_usdt FROM wallets WHERE agent_id = $1", [session.agent_id]);
      const newBalance = Number(walletRows[0].balance_usdt);

      await client.query(
        `INSERT INTO wallet_entries (agent_id, kind, entry_type, sub, occurred_at, amount, balance)
         VALUES ($1, 'DEPOSIT', 'Deposits', 'NOWPayments USDT TRC20', now(), $2, $3)`,
        [session.agent_id, `+${creditedAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`, `Bal ${newBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
