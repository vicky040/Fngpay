/**
 * Manually fix the last payment that didn't receive an agent code
 * Run: node scripts/fix-last-payment.js
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

const BOT_TOKEN = "8531306572:AAGf0x98EPcYfzr2pia6_eR8WQnzK0YP7bw";
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function sendTelegramMessage(chatId, text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    throw new Error(`Telegram sendMessage failed: ${res.status} ${await res.text()}`);
  }

  return res.json();
}

async function generateAgentCode(client) {
  for (let attempt = 0; attempt < 20; attempt++) {
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    }
    const code = `PV-${suffix}`;

    const { rows } = await client.query(
      "SELECT 1 FROM agents WHERE agent_code = $1 UNION SELECT 1 FROM telegram_onboarding_sessions WHERE agent_code = $1",
      [code]
    );

    if (rows.length === 0) return code;
  }
  throw new Error("Could not generate a unique agent code after 20 attempts");
}

async function fixLastPayment() {
  const client = await pool.connect();

  try {
    console.log('🔍 Finding last payment without agent code...\n');

    // Find the most recent payment that doesn't have an agent code
    const { rows } = await client.query(`
      SELECT
        id,
        chat_id,
        telegram_username,
        payment_id,
        provider_status,
        status,
        agent_code,
        credited_at,
        created_at
      FROM telegram_onboarding_sessions
      ORDER BY created_at DESC
      LIMIT 5
    `);

    if (rows.length === 0) {
      console.log('❌ No payments found');
      return;
    }

    console.log('📋 Recent payments:');
    rows.forEach((row, index) => {
      console.log(`\n${index + 1}. Session ID: ${row.id}`);
      console.log(`   Chat ID: ${row.chat_id}`);
      console.log(`   Username: ${row.telegram_username || 'N/A'}`);
      console.log(`   Payment ID: ${row.payment_id}`);
      console.log(`   Status: ${row.status}`);
      console.log(`   Provider Status: ${row.provider_status}`);
      console.log(`   Agent Code: ${row.agent_code || 'NONE'}`);
      console.log(`   Credited At: ${row.credited_at || 'N/A'}`);
      console.log(`   Created At: ${row.created_at}`);
    });

    // Find the first one without an agent code
    const sessionToFix = rows.find(row => !row.agent_code);

    if (!sessionToFix) {
      console.log('\n✅ All recent payments already have agent codes!');
      return;
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Fixing this session:');
    console.log(`   Session ID: ${sessionToFix.id}`);
    console.log(`   Chat ID: ${sessionToFix.chat_id}`);
    console.log(`   Username: ${sessionToFix.telegram_username || 'N/A'}`);
    console.log(`   Status: ${sessionToFix.status}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await client.query('BEGIN');

    // Generate agent code
    console.log('🎟️  Generating agent code...');
    const agentCode = await generateAgentCode(client);
    console.log(`✅ Generated: ${agentCode}\n`);

    // Update database
    console.log('💾 Updating database...');
    await client.query(
      `UPDATE telegram_onboarding_sessions
       SET agent_code = $1,
           credited_at = NOW(),
           status = 'completed',
           updated_at = NOW()
       WHERE id = $2`,
      [agentCode, sessionToFix.id]
    );
    console.log('✅ Database updated\n');

    await client.query('COMMIT');

    // Send to Telegram
    console.log('📤 Sending Telegram message...');
    try {
      await sendTelegramMessage(
        sessionToFix.chat_id,
        `✅ Payment confirmed!\n\nYour Agent ID is: <b>${agentCode}</b>\n\nGo back to the site and register using this Agent ID along with your email and mobile number, then complete Authenticator setup.\n\n🌐 Website: https://fngpay.vercel.app/register`
      );
      console.log('✅ Telegram message sent successfully!\n');
    } catch (err) {
      console.error('⚠️  Failed to send Telegram message:', err.message);
      console.log('   But agent code is saved in database!\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Chat ID: ${sessionToFix.chat_id}`);
    console.log(`Agent Code: ${agentCode}`);
    console.log(`Session ID: ${sessionToFix.id}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixLastPayment().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
