import type { Metadata } from "next";
import { requireAdmin } from "@/lib/require-admin";
import { UsersView } from "./UsersView";

export const metadata: Metadata = {
  title: "Users Management — Fngpay Admin",
};

export default async function UsersPage() {
  const admin = await requireAdmin();
  return <UsersView admin={admin} />;
}
