import type { Metadata } from "next";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = {
  title: "Change Password — Fngpay",
};

export default function PasswordPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Change Password</h2>
          <div className="page-sub">Update your login password.</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <PasswordForm />
      </div>
    </>
  );
}
