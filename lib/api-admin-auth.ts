import { requireApiAgent } from './api-auth';
import { NextResponse } from 'next/server';

/**
 * Require admin access for API routes (PV-ADMIN1 and PV-ADMIN)
 *
 * Use this in API route handlers to protect admin endpoints.
 * Returns 403 error for non-admin users.
 *
 * @example
 * ```typescript
 * export async function POST(request: Request) {
 *   const auth = await requireApiAdmin();
 *   if ('error' in auth) return auth.error;
 *
 *   // Admin-only logic here
 *   return NextResponse.json({ success: true });
 * }
 * ```
 */
export async function requireApiAdmin() {
  const auth = await requireApiAgent();
  if ('error' in auth) return auth;

  // Check if admin (PV-ADMIN1 or PV-ADMIN)
  if (auth.agent.agentCode !== 'PV-ADMIN1' && auth.agent.agentCode !== 'PV-ADMIN') {
    return {
      error: NextResponse.json(
        { error: 'Admin access required. Only PV-ADMIN1 and PV-ADMIN can access this endpoint.' },
        { status: 403 }
      )
    };
  }

  return auth;
}
