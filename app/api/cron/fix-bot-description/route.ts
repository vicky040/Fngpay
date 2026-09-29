import { NextResponse } from "next/server";

const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw";

// The correct bot description we want to maintain
const CORRECT_DESCRIPTION = `Welcome to FNGPay P2P Partner Panel

Connect your Telegram account to manage your USDT deposits, withdrawals, and earnings.

Start by linking your account at our platform.

For support, contact: @fngpayofficial`;

function apiUrl(method: string): string {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

export async function GET(request: Request) {
  try {
    // Optional: Verify cron secret (can be skipped for external cron services)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "fngpay-cron-secret-2024";
    const secretParam = new URL(request.url).searchParams.get("secret");

    // Check auth via header or URL parameter
    const isAuthorized =
      authHeader === `Bearer ${cronSecret}` ||
      secretParam === cronSecret;

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized - provide secret in header or ?secret= parameter" }, { status: 401 });
    }

    console.log("🔍 Checking bot description...");

    // Get current bot description
    const getDescRes = await fetch(apiUrl("getMyDescription"), {
      method: "GET",
    });

    if (!getDescRes.ok) {
      throw new Error(`Failed to get description: ${getDescRes.status}`);
    }

    const currentData = await getDescRes.json();
    const currentDescription = currentData.result?.description || "";

    console.log("Current description:", currentDescription.substring(0, 50) + "...");

    // Check if description needs fixing
    if (currentDescription === CORRECT_DESCRIPTION) {
      console.log("✅ Bot description is correct - no action needed");
      return NextResponse.json({
        status: "ok",
        message: "Bot description is correct",
        checked_at: new Date().toISOString(),
      });
    }

    // Description is wrong - fix it
    console.log("⚠️ Bot description is incorrect - fixing now...");

    const setDescRes = await fetch(apiUrl("setMyDescription"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: CORRECT_DESCRIPTION,
      }),
    });

    if (!setDescRes.ok) {
      const errorText = await setDescRes.text();
      throw new Error(`Failed to set description: ${setDescRes.status} ${errorText}`);
    }

    console.log("✅ Bot description fixed successfully!");

    return NextResponse.json({
      status: "fixed",
      message: "Bot description was incorrect and has been fixed",
      fixed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error in fix-bot-description cron:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        error_at: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
