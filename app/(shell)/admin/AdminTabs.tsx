"use client";

import { useState } from "react";
import { AdminView as AdminDashboard } from "./AdminView";
import { CreateAgent } from "./CreateAgent";
import { Icon } from "../../components/Icon";

type Agent = {
  id: number;
  agentCode: string;
  fullName: string;
};

type Tab = {
  id: string;
  label: string;
  icon: string;
};

const TABS: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: "asset" },
  { id: "create-agent", label: "Create Agent", icon: "user" },
];

export function AdminTabs({ admin }: { admin: Agent }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div>
      {/* Tabs Header */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--stroke)",
          borderRadius: 6,
          padding: "4px",
          display: "flex",
          gap: "4px",
          marginBottom: 20,
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: "10px 16px",
                fontSize: 14,
                fontWeight: 500,
                background: isActive ? "var(--moss-500)" : "transparent",
                color: isActive ? "white" : "var(--ash-600)",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s",
              }}
            >
              <Icon name={tab.icon as any} size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "dashboard" && <AdminDashboard admin={admin} />}
        {activeTab === "create-agent" && <CreateAgent />}
      </div>
    </div>
  );
}
