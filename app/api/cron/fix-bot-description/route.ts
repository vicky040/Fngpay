import { NextResponse } from "next/server";

const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw";

// The correct bot description we want to maintain
const CORRECT_DESCRIPTION = `Welcome to FNGPay P2P Partner Panel

Connect your Telegram account to manage your USDT deposits, withdrawals, and earnings.

Start by linking your account at our platform.

For support, contact: @fngpayofficial`;

// The correct bot about/bio section (shown in Bot Info)
const CORRECT_ABOUT = `FNGPay P2P Partner Panel

Manage your USDT deposits, withdrawals, and earnings through Telegram.

For support: @fngpayofficial`;

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

    console.log("🔍 Checking bot description and about section...");

    let needsFix = false;
    const fixes: string[] = [];

    // Check and fix Description (Welcome message)
    const getDescRes = await fetch(apiUrl("getMyDescription"), {
      method: "GET",
    });

    if (getDescRes.ok) {
      const currentData = await getDescRes.json();
      const currentDescription = currentData.result?.description || "";

      if (currentDescription !== CORRECT_DESCRIPTION) {
        console.log("⚠️ Bot description is incorrect - fixing...");
        needsFix = true;

        const setDescRes = await fetch(apiUrl("setMyDescription"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: CORRECT_DESCRIPTION,
          }),
        });

        if (setDescRes.ok) {
          console.log("✅ Bot description fixed");
          fixes.push("description");
        }
      }
    }

    // Check and fix Short Description (Bot Info / About section)
    const getShortDescRes = await fetch(apiUrl("getMyShortDescription"), {
      method: "GET",
    });

    if (getShortDescRes.ok) {
      const currentShortData = await getShortDescRes.json();
      const currentShortDescription = currentShortData.result?.short_description || "";

      if (currentShortDescription !== CORRECT_ABOUT) {
        console.log("⚠️ Bot about/bio is incorrect - fixing...");
        needsFix = true;

        const setShortDescRes = await fetch(apiUrl("setMyShortDescription"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            short_description: CORRECT_ABOUT,
          }),
        });

        if (setShortDescRes.ok) {
          console.log("✅ Bot about/bio fixed");
          fixes.push("about");
        }
      }
    }

    // Return result
    if (!needsFix) {
      console.log("✅ Bot description and about are correct - no action needed");
      return NextResponse.json({
        status: "ok",
        message: "Bot description and about section are correct",
        checked_at: new Date().toISOString(),
      });
    }

    console.log(`✅ Fixed: ${fixes.join(", ")}`);

    return NextResponse.json({
      status: "fixed",
      message: `Bot ${fixes.join(" and ")} fixed successfully`,
      fixed_items: fixes,
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
