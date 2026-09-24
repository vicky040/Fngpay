import type { Metadata } from "next";
import { requireAdmin } from "@/lib/require-admin";
import { AdminView } from "./AdminView";

export const metadata: Metadata = {
  title: "Admin Panel — Fngpay",
};

export default async function AdminPage() {
  // Protect page - only PV-ADMIN1 can access
  const admin = await requireAdmin();

  return <AdminView admin={admin} />;
}
