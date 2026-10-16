"use client";

import { useState } from "react";
import { Icon } from "../../components/Icon";

type Transaction = {
  id: string;
  type: "payin" | "payout" | "commission";
  amount: string;
  date: string;
  description: string;
};

export function CreateAgent() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    telegramId: "",
    password: "",
    securityDepositAmount: "",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: Date.now().toString(),
      type: "payin",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    agentCode?: string;
    message?: string;
    error?: string;
  } | null>(null);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null);
  }

  function addTransaction() {
    setTransactions([
      ...transactions,
      {
        id: Date.now().toString(),
        type: "payin",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      },
    ]);
  }

  function removeTransaction(id: string) {
    if (transactions.length <= 1) return;
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  function updateTransaction(id: string, field: keyof Transaction, value: string) {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  }

  function calculateBalance() {
    const security = parseFloat(formData.securityDepositAmount) || 0;
    const txTotal = transactions.reduce((sum, tx) => {
      const amount = parseFloat(tx.amount) || 0;
      return sum + (tx.type === "payout" ? -amount : amount);
    }, 0);
    return (security + txTotal).toFixed(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!formData.fullName || !formData.email || !formData.mobile || !formData.password) {
      setResult({
        success: false,
        error: "Please fill in all required fields (Name, Email, Mobile, Password)",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setResult({
        success: false,
        error: "Please enter a valid email address",
      });
      return;
    }

    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setResult({
        success: false,
        error: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    // Validate transactions
    const validTransactions = transactions.filter(
      (t) => parseFloat(t.amount) > 0 && t.date
    );

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          transactions: validTransactions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({
          success: false,
          error: data.error || "Failed to create agent",
        });
        return;
      }

      setResult({
        success: true,
        agentCode: data.agentCode,
        message: data.message,
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        telegramId: "",
        password: "",
        securityDepositAmount: "",
      });
      setTransactions([
        {
          id: Date.now().toString(),
          type: "payin",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
        },
      ]);
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to create agent",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--stroke)",
          borderRadius: 6,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 500 }}>
          Create New Agent
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ash-500)" }}>
          Manually create a new agent with multiple transactions
        </p>
      </div>

      {result && (
        <div
          style={{
            background: result.success ? "var(--moss-50)" : "var(--crimson-50)",
            border: `1px solid ${result.success ? "var(--moss-400)" : "var(--crimson-400)"}`,
            borderRadius: 6,
            padding: 14,
            marginBottom: 20,
          }}
        >
          {result.success ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Icon name="check" width={18} height={18} />
                <strong style={{ fontSize: 14 }}>Agent Created Successfully!</strong>
              </div>
              <p style={{ margin: "4px 0", fontSize: 13 }}>
                Agent Code: <strong>{result.agentCode}</strong>
              </p>
              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--ash-600)" }}>
                {result.message}
              </p>
            </>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Icon name="close" width={18} height={18} />
                <strong style={{ fontSize: 14 }}>Error</strong>
              </div>
              <p style={{ margin: 0, fontSize: 13 }}>{result.error}</p>
            </>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--stroke)",
            borderRadius: 6,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: "0 0 16px 0", fontSize: 14, fontWeight: 500 }}>
            Basic Information
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
              Full Name <span style={{ color: "var(--crimson-500)" }}>*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Enter full name"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--stroke)",
                borderRadius: 4,
                background: "var(--background)",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
              Email <span style={{ color: "var(--crimson-500)" }}>*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="agent@example.com"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--stroke)",
                borderRadius: 4,
                background: "var(--background)",
              }}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
                Mobile (10 digits) <span style={{ color: "var(--crimson-500)" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) =>
                  handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
                maxLength={10}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: "1px solid var(--stroke)",
                  borderRadius: 4,
                  background: "var(--background)",
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
                Telegram ID (optional)
              </label>
              <input
                type="text"
                value={formData.telegramId}
                onChange={(e) => handleChange("telegramId", e.target.value)}
                placeholder="@username"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: 14,
                  border: "1px solid var(--stroke)",
                  borderRadius: 4,
                  background: "var(--background)",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
              Password <span style={{ color: "var(--crimson-500)" }}>*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder="Enter password"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--stroke)",
                borderRadius: 4,
                background: "var(--background)",
              }}
              required
            />
          </div>
        </div>

        {/* Security Deposit */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--stroke)",
            borderRadius: 6,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 500 }}>
            Security Deposit
          </h3>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--ash-500)", marginBottom: 4 }}>
              Amount (USDT)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.securityDepositAmount}
              onChange={(e) => handleChange("securityDepositAmount", e.target.value)}
              placeholder="0.00"
              style={{
                width: "100%",
                padding: "8px 12px",
                fontSize: 14,
                border: "1px solid var(--stroke)",
                borderRadius: 4,
                background: "var(--background)",
              }}
            />
            <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "var(--ash-500)" }}>
              Security deposit marks account as verified
            </p>
          </div>
        </div>

        {/* Transactions */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--stroke)",
            borderRadius: 6,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              Transactions
            </h3>
            <button
              type="button"
              onClick={addTransaction}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                fontWeight: 500,
                background: "var(--moss-500)",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              + Add Transaction
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {transactions.map((tx, index) => (
              <div
                key={tx.id}
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--stroke)",
                  borderRadius: 4,
                  padding: 12,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ash-600)" }}>
                    Transaction {index + 1}
                  </span>
                  {transactions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTransaction(tx.id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        background: "var(--crimson-50)",
                        color: "var(--crimson-600)",
                        border: "1px solid var(--crimson-400)",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 140px", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--ash-500)", marginBottom: 4 }}>
                      Type
                    </label>
                    <select
                      value={tx.type}
                      onChange={(e) =>
                        updateTransaction(tx.id, "type", e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 13,
                        border: "1px solid var(--stroke)",
                        borderRadius: 4,
                        background: "var(--card)",
                      }}
                    >
                      <option value="payin">Payin</option>
                      <option value="payout">Payout</option>
                      <option value="commission">Commission</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--ash-500)", marginBottom: 4 }}>
                      Amount (USDT)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={tx.amount}
                      onChange={(e) =>
                        updateTransaction(tx.id, "amount", e.target.value)
                      }
                      placeholder="0.00"
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 13,
                        border: "1px solid var(--stroke)",
                        borderRadius: 4,
                        background: "var(--card)",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, color: "var(--ash-500)", marginBottom: 4 }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={tx.date}
                      onChange={(e) =>
                        updateTransaction(tx.id, "date", e.target.value)
                      }
                      max={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "6px 8px",
                        fontSize: 13,
                        border: "1px solid var(--stroke)",
                        borderRadius: 4,
                        background: "var(--card)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--ash-500)", marginBottom: 4 }}>
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={tx.description}
                    onChange={(e) =>
                      updateTransaction(tx.id, "description", e.target.value)
                    }
                    placeholder="e.g., Initial deposit, Withdrawal, Commission payment"
                    style={{
                      width: "100%",
                      padding: "6px 8px",
                      fontSize: 13,
                      border: "1px solid var(--stroke)",
                      borderRadius: 4,
                      background: "var(--card)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Balance Preview */}
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            background: "var(--moss-50)",
            border: "1px solid var(--moss-400)",
            borderRadius: 6,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ash-700)" }}>
              Initial Wallet Balance:
            </span>
            <strong style={{ fontSize: 18, color: "var(--moss-600)" }}>
              {calculateBalance()} USDT
            </strong>
          </div>
          <p style={{ margin: "6px 0 0 0", fontSize: 11, color: "var(--ash-600)" }}>
            Security Deposit + All Payins - All Payouts + Commissions
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            padding: "12px 20px",
            fontSize: 14,
            fontWeight: 500,
            background: submitting ? "var(--ash-300)" : "var(--moss-500)",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Creating Agent..." : "Create Agent"}
        </button>
      </form>

      <div
        style={{
          marginTop: 20,
          padding: 14,
          background: "var(--blue-50)",
          border: "1px solid var(--blue-400)",
          borderRadius: 6,
          fontSize: 12,
          color: "var(--ash-600)",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 500 }}>ℹ️ How it works:</p>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Add multiple transactions with different types and dates</li>
          <li>Each transaction will create a wallet entry</li>
          <li>Payin adds to balance, Payout subtracts from balance</li>
          <li>Commission adds to balance</li>
          <li>Final balance will be calculated automatically</li>
        </ul>
      </div>
    </div>
  );
}
