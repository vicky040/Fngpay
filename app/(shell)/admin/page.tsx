import type { Metadata } from "next";
import { requireAdmin } from "@/lib/require-admin";
import { AdminTabs } from "./AdminTabs";

export const metadata: Metadata = {
  title: "Admin Panel — Fngpay",
};

export default async function AdminPage() {
  // Protect page - only PV-ADMIN1 can access
  const admin = await requireAdmin();

  return <AdminTabs admin={admin} />;
}
