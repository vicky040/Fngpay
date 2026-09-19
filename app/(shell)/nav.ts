import type { IconName } from "../components/Icon";

export const NAV: { label: string; icon: IconName; href: string }[] = [
  { label: "Home", icon: "site", href: "/" },
  { label: "Payin Orders", icon: "arrow-right", href: "/payin" },
  { label: "Payout Orders", icon: "arrow-right", href: "/payout" },
  { label: "History", icon: "clock", href: "/history" },
  { label: "Banks", icon: "budget", href: "/banks" },
  { label: "Password", icon: "user", href: "/password" },
  { label: "Commission", icon: "asset", href: "/earn" },
  { label: "Settings", icon: "settings", href: "/settings" },
  { label: "UTR", icon: "apps", href: "/utr" },
  { label: "Reports", icon: "asset", href: "/reports" },
  { label: "Help", icon: "info", href: "/help" },
  { label: "Refer & Earn", icon: "client", href: "/refer" },
  { label: "Add Funds", icon: "plus", href: "/funds" },
  { label: "Telegram Support", icon: "arrow-right", href: "/help" },
];

export const TABS: { label: string; icon: IconName; href: string | null }[] = [
  { label: "Home", icon: "site", href: "/" },
  { label: "History", icon: "clock", href: "/history" },
  { label: "Banks", icon: "budget", href: "/banks" },
  { label: "Earn", icon: "asset", href: "/earn" },
  { label: "More", icon: "menu", href: null },
];
