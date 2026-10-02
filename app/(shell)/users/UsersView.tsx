"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  agentCode: string;
  fullName: string;
  email: string;
  createdAt: string;
  securityDepositCompleted: boolean;
  securityDepositAmount: number;
  payinCommissionRate: number;
  payoutCommissionRate: number;
  balanceUsdt: number;
  totalPayinUsdt: number;
  totalPayoutUsdt: number;
  totalEarningUsdt: number;
};

type Admin = {
  id: number;
  agentCode: string;
  fullName: string;
  email: string;
};

export function UsersView({ admin }: { admin: Admin }) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    securityDepositAmount: 2000,
    payinCommissionRate: 6,
    payoutCommissionRate: 2,
    totalPayinUsdt: 0,
    totalPayoutUsdt: 0,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(user: User) {
    setEditingUser(user);
    setEditForm({
      securityDepositAmount: user.securityDepositAmount,
      payinCommissionRate: user.payinCommissionRate,
      payoutCommissionRate: user.payoutCommissionRate,
      totalPayinUsdt: user.totalPayinUsdt,
      totalPayoutUsdt: user.totalPayoutUsdt,
    });
  }

  function closeEditModal() {
    setEditingUser(null);
  }

  async function saveUserSettings() {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update user");

      alert("✅ User settings updated successfully!");
      closeEditModal();
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update user");
    }
  }

  async function approveSecurityDeposit(user: User) {
    if (!confirm(`Approve security deposit for ${user.agentCode}?\n\nThis will mark their ${user.securityDepositAmount} USDT security deposit as completed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/security-deposit/${user.id}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Failed to approve");
      }

      alert(`✅ Security deposit approved for ${user.agentCode}! User can now access full features.`);
      closeEditModal();
      loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to approve security deposit");
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--ash-500)" }}>
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px", background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: "8px", color: "#991B1B" }}>
        {error}
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--ink-900)", margin: 0 }}>
            Users Management
          </h2>
          <p style={{ fontSize: "14px", color: "var(--ash-600)", marginTop: "4px" }}>
            Manage user settings, deposits, and commissions
          </p>
        </div>
        <div style={{ fontSize: "14px", color: "var(--ash-600)" }}>
          Total: <strong>{users.length}</strong> users
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--paper)", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>👥</div>
          <div style={{ fontSize: "16px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
            No Users Yet
          </div>
          <div style={{ fontSize: "14px", color: "var(--ash-600)" }}>
            Users who complete onboarding will appear here
          </div>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--paper)", borderRadius: "12px", overflow: "hidden" }}>
            <thead>
              <tr style={{ background: "var(--moss-50)", borderBottom: "2px solid var(--border)" }}>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--ash-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Agent
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--ash-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Balance
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--ash-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Security Deposit
                </th>
                <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "var(--ash-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Commission Rates
                </th>
                <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "12px", fontWeight: "600", color: "var(--ash-700)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: "600", color: "var(--ink-900)", marginBottom: "4px" }}>
                      {user.fullName}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--ash-600)", fontFamily: "var(--font-mono)" }}>
                      {user.agentCode}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--ash-500)", marginTop: "2px" }}>
                      {user.email}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: "600", color: "var(--moss-600)" }}>
                      {user.balanceUsdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ash-500)", marginTop: "2px" }}>
                      Payin: {user.totalPayinUsdt.toFixed(0)} | Payout: {user.totalPayoutUsdt.toFixed(0)}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: "600", color: "var(--ink-800)" }}>
                        {user.securityDepositAmount.toLocaleString()} USDT
                      </div>
                      {user.securityDepositCompleted ? (
                        <span style={{ fontSize: "11px", padding: "2px 8px", background: "#D1FAE5", color: "#065F46", borderRadius: "12px", fontWeight: "600" }}>
                          ✓ Completed
                        </span>
                      ) : (
                        <span style={{ fontSize: "11px", padding: "2px 8px", background: "#FEF3C7", color: "#92400E", borderRadius: "12px", fontWeight: "600" }}>
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "13px", color: "var(--ink-800)" }}>
                      <div style={{ marginBottom: "4px" }}>
                        <strong>Payin:</strong> {user.payinCommissionRate}%
                      </div>
                      <div>
                        <strong>Payout:</strong> {user.payoutCommissionRate}%
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => openEditModal(user)}
                      style={{
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: "600",
                        background: "var(--moss-500)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--moss-600)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--moss-500)";
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px"
          }}
          onClick={closeEditModal}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "20px", fontWeight: "700", color: "var(--ink-900)", marginBottom: "8px" }}>
              Edit User Settings
            </h3>
            <p style={{ fontSize: "14px", color: "var(--ash-600)", marginBottom: "24px" }}>
              {editingUser.fullName} ({editingUser.agentCode})
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
                  Security Deposit Amount (USDT)
                </label>
                <input
                  type="number"
                  value={editForm.securityDepositAmount}
                  onChange={(e) => setEditForm({ ...editForm, securityDepositAmount: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "2px solid var(--border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
                  Payin Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.payinCommissionRate}
                  onChange={(e) => setEditForm({ ...editForm, payinCommissionRate: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "2px solid var(--border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
                  Payout Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={editForm.payoutCommissionRate}
                  onChange={(e) => setEditForm({ ...editForm, payoutCommissionRate: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "2px solid var(--border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
                  Total Payin (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalPayinUsdt}
                  onChange={(e) => setEditForm({ ...editForm, totalPayinUsdt: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "2px solid var(--border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)"
                  }}
                />
                <div style={{ fontSize: "11px", color: "var(--ash-500)", marginTop: "4px" }}>
                  💡 Admin can adjust total payin amount for corrections
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--ink-800)", marginBottom: "8px" }}>
                  Total Payout (USDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalPayoutUsdt}
                  onChange={(e) => setEditForm({ ...editForm, totalPayoutUsdt: parseFloat(e.target.value) || 0 })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: "14px",
                    border: "2px solid var(--border)",
                    borderRadius: "6px",
                    fontFamily: "var(--font-mono)"
                  }}
                />
                <div style={{ fontSize: "11px", color: "var(--ash-500)", marginTop: "4px" }}>
                  💡 Admin can adjust total payout amount for corrections
                </div>
              </div>
            </div>

            {/* Security Deposit Status */}
            {!editingUser.securityDepositCompleted && (
              <div style={{
                marginTop: "20px",
                padding: "14px",
                background: "#FEF3C7",
                border: "1px solid #FCD34D",
                borderRadius: "8px"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#92400E", marginBottom: "4px" }}>
                      ⏳ Security Deposit Pending
                    </div>
                    <div style={{ fontSize: "12px", color: "#78350F" }}>
                      {editingUser.securityDepositAmount.toLocaleString()} USDT needs approval
                    </div>
                  </div>
                  <button
                    onClick={() => approveSecurityDeposit(editingUser)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      background: "#10B981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    ✓ Approve Now
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              <button
                onClick={closeEditModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: "var(--ash-100)",
                  color: "var(--ink-800)",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveUserSettings}
                style={{
                  flex: 1,
                  padding: "12px",
                  fontSize: "14px",
                  fontWeight: "600",
                  background: "var(--moss-500)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
