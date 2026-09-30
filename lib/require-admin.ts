import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fngpay-admin-secret-2024"
);

/**
 * Require admin access (PV-ADMIN1 and PV-ADMIN)
 *
 * Use this in Server Components to protect admin pages.
 * Redirects non-admin users to admin login page.
 *
 * @example
 * ```typescript
 * export default async function AdminPage() {
 *   const admin = await requireAdmin();
 *   return <AdminView admin={admin} />;
 * }
 * ```
 */
export async function requireAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      redirect('/admin-login');
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Check if admin
    if (!payload.isAdmin) {
      redirect('/admin-login');
    }

    // Return admin info
    return {
      id: payload.agentId as number,
      agentCode: payload.agentCode as string,
      email: payload.email as string,
      fullName: payload.fullName as string || payload.agentCode as string,
    };
  } catch (error) {
    // Invalid token or expired
    redirect('/admin-login');
  }
}
