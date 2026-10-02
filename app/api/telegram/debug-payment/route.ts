import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { sendTelegramMessage } from "@/lib/telegram";

// Debug endpoint to check payment status and resend agent code if needed
// Usage: GET /api/telegram/debug-payment?chat_id=123456789
export async function GET(request: Request) {
  const url = new URL(request.url);
  const chatId = url.searchParams.get("chat_id");

  if (!chatId) {
    return NextResponse.json({ error: "Missing chat_id parameter" }, { status: 400 });
  }

  try {
    // Get all sessions for this chat
    const { rows } = await pool.query(
      `SELECT
        id,
        chat_id,
        payment_id,
        agent_code,
        status,
        provider_status,
        credited_at,
        created_at,
        updated_at
      FROM telegram_onboarding_sessions
      WHERE chat_id = $1
      ORDER BY created_at DESC`,
      [chatId]
    );

    if (rows.length === 0) {
      return NextResponse.json({
        error: "No payment sessions found for this chat_id",
        chatId,
      });
    }

    const latestSession = rows[0];

    // Check if agent code exists but wasn't sent
    if (latestSession.agent_code && latestSession.credited_at) {
      // Try to resend the agent code
      try {
        await sendTelegramMessage(
          chatId,
          `✅ Payment confirmed!\n\nYour Agent ID is: <b>${latestSession.agent_code}</b>\n\nGo back to the site and register using this Agent ID along with your email and mobile number, then complete Authenticator setup.`
        );

        return NextResponse.json({
          success: true,
          message: "Agent code resent successfully",
          session: latestSession,
          allSessions: rows,
        });
      } catch (err) {
        return NextResponse.json({
          error: "Failed to send message",
          errorDetails: err instanceof Error ? err.message : String(err),
          session: latestSession,
          allSessions: rows,
        });
      }
    }

    return NextResponse.json({
      info: "Session found but no agent code yet",
      reason: !latestSession.credited_at
        ? "Payment not credited yet (provider_status: " + latestSession.provider_status + ")"
        : "No agent code assigned",
      session: latestSession,
      allSessions: rows,
      instructions: {
        nextSteps: [
          "1. Check if payment_id exists and is valid",
          "2. Check provider_status - should be 'confirmed' or 'finished'",
          "3. If status is correct but no agent_code, there may be a bug in applyOnboardingPaymentStatus",
          "4. Check NOWPayments dashboard to verify payment status",
        ],
      },
    });
  } catch (error) {
    console.error("Debug payment error:", error);
    return NextResponse.json(
      {
        error: "Failed to query database",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
