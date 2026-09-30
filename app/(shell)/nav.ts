import type { IconName } from "../components/Icon";

// Admin Panel Navigation - Simplified for admin-only access
export const NAV: { label: string; icon: IconName; href: string }[] = [
  { label: "Admin Dashboard", icon: "apps", href: "/admin" },
];

// Mobile tabs - Admin only
export const TABS: { label: string; icon: IconName; href: string | null }[] = [
  { label: "Dashboard", icon: "apps", href: "/admin" },
  { label: "More", icon: "menu", href: null },
];
