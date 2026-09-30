const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_za7tkm6KulOX@ep-falling-sea-auzw7sij-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: true }
});

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting Admin Password...\n');

    // Get admin account
    const agentCode = process.argv[2] || 'PV-ADMIN1';
    const newPassword = process.argv[3] || 'Admin@123';

    console.log(`Agent Code: ${agentCode}`);
    console.log(`New Password: ${newPassword}\n`);

    // Check if admin exists
    const checkResult = await pool.query(
      'SELECT id, agent_code, full_name, email FROM agents WHERE agent_code = $1',
      [agentCode]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Admin account not found!');
      console.log(`Available admin codes: PV-ADMIN, PV-ADMIN1\n`);
      return;
    }

    const admin = checkResult.rows[0];
    console.log(`Found Admin: ${admin.full_name} (${admin.email})\n`);

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE agents SET password_hash = $1 WHERE agent_code = $2',
      [passwordHash, agentCode]
    );

    console.log('✅ Password reset successfully!\n');
    console.log('─────────────────────────────────────');
    console.log('Admin Panel Login Credentials:');
    console.log('─────────────────────────────────────');
    console.log(`Username: ${agentCode}`);
    console.log(`Or Email: ${admin.email}`);
    console.log(`Password: ${newPassword}`);
    console.log('─────────────────────────────────────\n');
    console.log('🌐 Admin Panel URL:');
    console.log('   https://your-admin-site.netlify.app/admin-login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

// Usage:
// node reset-admin-password.js [AGENT_CODE] [NEW_PASSWORD]
//
// Examples:
//   node reset-admin-password.js PV-ADMIN1 MyNewPassword123
//   node reset-admin-password.js PV-ADMIN Admin@2024
//
// Default: PV-ADMIN1 with password "Admin@123"

resetAdminPassword();
