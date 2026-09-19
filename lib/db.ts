import { Pool } from "pg";

// Next.js dev mode hot-reloads route modules on every request; without this
// global-singleton guard, each reload would open a fresh Pool and leak
// connections until Postgres's max_connections is exhausted.
declare global {
  var _pgPool: Pool | undefined;
}

// Parse DATABASE_URL and update sslmode to verify-full for production
function getConnectionConfig() {
  const connectionString = process.env.DATABASE_URL;

  if (process.env.NODE_ENV === "production" && connectionString) {
    // Replace sslmode=require with sslmode=verify-full to silence the warning
    const updatedConnectionString = connectionString.replace(
      /sslmode=(require|prefer|verify-ca)/,
      'sslmode=verify-full'
    );

    return {
      connectionString: updatedConnectionString,
      ssl: { rejectUnauthorized: true },
    };
  }

  return { connectionString };
}

export const pool =
  global._pgPool ??
  new Pool(getConnectionConfig());

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}
