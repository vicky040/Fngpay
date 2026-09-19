import type { Metadata } from "next";
import { SettingsView } from "./SettingsView";

export const metadata: Metadata = {
  title: "Settings — Fngpay",
};

export default function SettingsPage() {
  return (
    <>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Settings</h2>
          <div className="page-sub">Manage profile, credentials, and security preferences.</div>
        </div>
      </div>
      <SettingsView />
    </>
  );
}
