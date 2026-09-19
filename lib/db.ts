import { Pool } from "pg";

// Next.js dev mode hot-reloads route modules on every request; without this
// global-singleton guard, each reload would open a fresh Pool and leak
// connections until Postgres's max_connections is exhausted.
declare global {
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: true }
        : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}
