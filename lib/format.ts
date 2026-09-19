export function formatUsdt(amount: number): string {
  return `${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

// "05 Sept 2026, 01:08 pm" — used for the wallet ledger (History/Home).
export function formatEntryDateTime(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const ampm = d.getUTCHours() >= 12 ? "pm" : "am";
  const hours12 = String(d.getUTCHours() % 12 || 12).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours12}:${minutes} ${ampm}`;
}

// "05 Sept 2026" — used for Home's recent-activity list (no time-of-day).
export function formatEntryDate(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

// "2026-08-20" — used for UTR records.
export function formatIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
