import type { Metadata } from "next";
import { AdminLoginView } from "./AdminLoginView";

export const metadata: Metadata = {
  title: "Admin Login — Fngpay",
};

export default function AdminLoginPage() {
  return <AdminLoginView />;
}
