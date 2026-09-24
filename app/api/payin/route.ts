import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireApiAgent } from "@/lib/api-auth";
import { formatEntryDateTime } from "@/lib/format";

export async function GET() {
  const auth = await requireApiAgent();
  if ("error" in auth) return auth.error;

  try {
    // Query deposit_sessions for completed and pending deposits
    const { rows } = await pool.query<{
      id: number;
      pay_amount: string;
      pay_currency: string;
      price_amount: string;
      price_currency: string;
      provider_status: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT
        id,
        pay_amount,
        pay_currency,
        price_amount,
        price_currency,
        provider_status,
        status,
        created_at
      FROM deposit_sessions
      WHERE agent_id = $1
      ORDER BY created_at DESC`,
      [auth.agent.id]
    );

    const deposits = rows.map((r) => {
      try {
        const payAmount = Number(r.pay_amount || 0);
        const priceAmount = Number(r.price_amount || 0);

        return {
          id: r.id,
          amountUsdt: payAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          amountInr: Math.round(priceAmount).toLocaleString('en-IN'),
          status: r.status || 'unknown',
          providerStatus: r.provider_status || 'unknown',
          createdAt: formatEntryDateTime(new Date(r.created_at)),
        };
      } catch (mapError) {
        console.error('Error mapping deposit row:', mapError, r);
        // Return a fallback object if mapping fails
        return {
          id: r.id,
          amountUsdt: '0.00',
          amountInr: '0',
          status: r.status || 'unknown',
          providerStatus: r.provider_status || 'unknown',
          createdAt: new Date(r.created_at).toLocaleString(),
        };
      }
    });

    return NextResponse.json({ deposits });
  } catch (error) {
    console.error('Payin API error:', error);

    // Return empty deposits instead of error to prevent UI break
    return NextResponse.json({ deposits: [] });
  }
}
