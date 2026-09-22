import { createHmac } from "crypto";

// TEMPORARY: Hardcoded NOWPayments credentials for testing
const HARDCODED_API_KEY = "S464KP4-3J6MZN9-MB361R6-ACERHJS";
const HARDCODED_IPN_SECRET = "BqF/1wxKjG87kV4y1nj4pnqSIjjgK4YN";
const HARDCODED_SANDBOX = true; // Set to false for production

// https://api.nowpayments.io (production) / https://api-sandbox.nowpayments.io
// (sandbox — separate account, separate API key, no real funds move).
// Endpoints, fields, and the IPN signing scheme below are NOWPayments' own
// documented contract, not something this app invents.
const BASE_URL = (process.env.NOWPAYMENTS_SANDBOX === "true" || HARDCODED_SANDBOX)
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1";

export const USDT_TRC20 = "usdttrc20";

export function isNowPaymentsConfigured(): boolean {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || HARDCODED_API_KEY;
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || HARDCODED_IPN_SECRET;
  return Boolean(apiKey && ipnSecret);
}

export type CreatePaymentResult = {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string | null;
  order_description: string | null;
};

export async function createPayment(params: {
  priceAmount: number;
  priceCurrency: string;
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl: string;
}): Promise<CreatePaymentResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || HARDCODED_API_KEY;
  const res = await fetch(`${BASE_URL}/payment`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      pay_currency: USDT_TRC20,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NOWPayments createPayment failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getPaymentStatus(paymentId: string): Promise<CreatePaymentResult> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || HARDCODED_API_KEY;
  const res = await fetch(`${BASE_URL}/payment/${paymentId}`, {
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`NOWPayments getPaymentStatus failed: ${res.status} ${text}`);
  }
  return res.json();
}

// NOWPayments signs the alphabetically-sorted (recursively) JSON
// serialization of the IPN body with HMAC-SHA512 using your IPN secret, and
// sends the hex digest in the x-nowpayments-sig header. This has to match
// their sort exactly (keys sorted at every nesting level) or every valid
// callback looks forged.
function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortDeep((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

export function verifyIpnSignature(body: unknown, signature: string | null): boolean {
  if (!signature) return false;
  const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || HARDCODED_IPN_SECRET;
  const sortedJson = JSON.stringify(sortDeep(body));
  const expected = createHmac("sha512", ipnSecret).update(sortedJson).digest("hex");
  return expected === signature;
}

// finished/confirmed both mean "the funds have genuinely arrived" per
// NOWPayments' docs — confirmed is the on-chain-confirmed intermediate
// state, finished is after their own payout/conversion step completes.
// Credit the wallet the first time either is seen; see credited_at.
export const CREDITABLE_STATUSES = new Set(["confirmed", "finished"]);
export const TERMINAL_FAILURE_STATUSES = new Set(["failed", "expired", "refunded"]);
