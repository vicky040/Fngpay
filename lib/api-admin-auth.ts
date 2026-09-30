import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fngpay-admin-secret-2024"
);

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
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized. Please login.' },
          { status: 401 }
        )
      };
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check if admin
    if (!payload.isAdmin) {
      return {
        error: NextResponse.json(
          { error: 'Admin access required. Only PV-ADMIN1 and PV-ADMIN can access this endpoint.' },
          { status: 403 }
        )
      };
    }

    // Return admin info
    return {
      admin: {
        id: payload.agentId as number,
        agentCode: payload.agentCode as string,
        email: payload.email as string,
        fullName: payload.fullName as string || payload.agentCode as string,
      }
    };
  } catch (error) {
    return {
      error: NextResponse.json(
        { error: 'Invalid or expired session. Please login again.' },
        { status: 401 }
      )
    };
  }
}
