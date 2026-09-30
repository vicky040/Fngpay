import type { IconName } from "../components/Icon";

// Admin Panel Navigation - Simplified for admin-only access
export const NAV: { label: string; icon: IconName; href: string }[] = [
  { label: "Dashboard", icon: "apps", href: "/admin" },
  { label: "Users", icon: "client", href: "/users" },
];

// Mobile tabs - Admin only
export const TABS: { label: string; icon: IconName; href: string | null }[] = [
  { label: "Dashboard", icon: "apps", href: "/admin" },
  { label: "Users", icon: "client", href: "/users" },
  { label: "More", icon: "menu", href: null },
];
