import { requireAgent } from './require-agent';
import { redirect } from 'next/navigation';

/**
 * Require admin access (PV-ADMIN1 and PV-ADMIN)
 *
 * Use this in Server Components to protect admin pages.
 * Redirects non-admin users to home page.
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
  const agent = await requireAgent();

  // Only PV-ADMIN1 and PV-ADMIN have admin access
  if (agent.agentCode !== 'PV-ADMIN1' && agent.agentCode !== 'PV-ADMIN') {
    redirect('/');
  }

  return agent;
}
