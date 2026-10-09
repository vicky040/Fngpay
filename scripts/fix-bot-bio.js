/**
 * Fix Telegram bot bio/description
 * Run: node scripts/fix-bot-bio.js
 */

const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw";

const CORRECT_DESCRIPTION = `Welcome to FNGPay P2P Partner Panel

Connect your Telegram account to manage your USDT deposits, withdrawals, and earnings.

Start by linking your account at our platform.

For support, contact: @fngpayofficial`;

const CORRECT_SHORT_DESCRIPTION = `FNGPay P2P Partner Panel - Manage your USDT deposits, withdrawals, and earnings through Telegram. For support: @fngpayofficial`;

const CORRECT_BIO = `FNGPay - P2P USDT Payment Panel. Manage deposits & withdrawals. Support: @fngpayofficial`;

function apiUrl(method) {
  return `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
}

async function fixBotBio() {
  try {
    console.log('🔍 Checking current bot info...\n');

    // 1. Get current bot info
    console.log('📋 Getting bot info...');
    const botInfoRes = await fetch(apiUrl('getMe'));
    const botInfo = await botInfoRes.json();

    if (botInfo.ok) {
      console.log('✅ Bot Info:');
      console.log(`   Username: @${botInfo.result.username}`);
      console.log(`   Name: ${botInfo.result.first_name}\n`);
    }

    // 2. Get current description (welcome message)
    console.log('📋 Getting current description (welcome message)...');
    const getDescRes = await fetch(apiUrl('getMyDescription'));
    const descData = await getDescRes.json();

    if (descData.ok) {
      const currentDesc = descData.result?.description || '';
      console.log('Current Description:');
      console.log(currentDesc || '(empty)');
      console.log('');
    }

    // 3. Get current short description (bot info bio)
    console.log('📋 Getting current short description (bio)...');
    const getShortDescRes = await fetch(apiUrl('getMyShortDescription'));
    const shortDescData = await getShortDescRes.json();

    if (shortDescData.ok) {
      const currentShortDesc = shortDescData.result?.short_description || '';
      console.log('Current Bio:');
      console.log(currentShortDesc || '(empty)');
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 Updating bot description and bio...\n');

    // 4. Set description (welcome message)
    console.log('1️⃣ Setting description (welcome message)...');
    const setDescRes = await fetch(apiUrl('setMyDescription'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: CORRECT_DESCRIPTION,
      }),
    });

    const setDescResult = await setDescRes.json();
    if (setDescResult.ok) {
      console.log('✅ Description updated successfully\n');
    } else {
      console.log('❌ Failed to update description:', setDescResult);
    }

    // 5. Set short description (bio)
    console.log('2️⃣ Setting short description (bio)...');
    const setShortDescRes = await fetch(apiUrl('setMyShortDescription'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        short_description: CORRECT_BIO,
      }),
    });

    const setShortDescResult = await setShortDescRes.json();
    if (setShortDescResult.ok) {
      console.log('✅ Bio updated successfully\n');
    } else {
      console.log('❌ Failed to update bio:', setShortDescResult);
    }

    // 6. Verify the changes
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Verifying updates...\n');

    const verifyDescRes = await fetch(apiUrl('getMyDescription'));
    const verifyDescData = await verifyDescRes.json();

    if (verifyDescData.ok) {
      console.log('📋 New Description:');
      console.log(verifyDescData.result?.description || '(empty)');
      console.log('');
    }

    const verifyShortDescRes = await fetch(apiUrl('getMyShortDescription'));
    const verifyShortDescData = await verifyShortDescRes.json();

    if (verifyShortDescData.ok) {
      console.log('📋 New Bio:');
      console.log(verifyShortDescData.result?.short_description || '(empty)');
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ DONE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('The bot bio should now be updated.');
    console.log('Close and reopen the bot in Telegram to see changes.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

fixBotBio().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
