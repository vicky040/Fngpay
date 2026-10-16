"use client";

import { useState } from "react";
import { Icon } from "../../components/Icon";

export function CreateAgent() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    telegramId: "",
    password: "",
    securityDepositAmount: "",
    initialPayin: "",
    initialPayout: "",
    transactionDate: new Date().toISOString().split("T")[0], // Today's date
  });

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    agentCode?: string;
    message?: string;
    error?: string;
  } | null>(null);

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setResult(null); // Clear previous result
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

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setResult({
        success: false,
        error: "Please enter a valid email address",
      });
      return;
    }

    // Validate mobile (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setResult({
        success: false,
        error: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/create-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

      // Reset form on success
      setFormData({
        fullName: "",
        email: "",
        mobile: "",
        telegramId: "",
        password: "",
        securityDepositAmount: "",
        initialPayin: "",
        initialPayout: "",
        transactionDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to create agent",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const calculateBalance = () => {
    const security = parseFloat(formData.securityDepositAmount) || 0;
    const payin = parseFloat(formData.initialPayin) || 0;
    const payout = parseFloat(formData.initialPayout) || 0;
    return (security + payin - payout).toFixed(2);
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
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
          Manually create a new agent account with initial balance and transactions
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
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ash-500)",
                marginBottom: 4,
              }}
            >
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
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ash-500)",
                marginBottom: 4,
              }}
            >
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
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--ash-500)",
                  marginBottom: 4,
                }}
              >
                Mobile (10 digits) <span style={{ color: "var(--crimson-500)" }}>*</span>
              </label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
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
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--ash-500)",
                  marginBottom: 4,
                }}
              >
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
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ash-500)",
                marginBottom: 4,
              }}
            >
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
            Financial Details (All amounts in USDT)
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 12,
                color: "var(--ash-500)",
                marginBottom: 4,
              }}
            >
              Transaction Date
            </label>
            <input
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleChange("transactionDate", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
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
              Date for initial transactions (defaults to today)
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--ash-500)",
                  marginBottom: 4,
                }}
              >
                Security Deposit
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
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--ash-500)",
                  marginBottom: 4,
                }}
              >
                Initial Payin
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.initialPayin}
                onChange={(e) => handleChange("initialPayin", e.target.value)}
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
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--ash-500)",
                  marginBottom: 4,
                }}
              >
                Initial Payout
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.initialPayout}
                onChange={(e) => handleChange("initialPayout", e.target.value)}
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
            </div>
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: "var(--moss-50)",
              border: "1px solid var(--moss-400)",
              borderRadius: 4,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--ash-600)" }}>
                Initial Wallet Balance:
              </span>
              <strong style={{ fontSize: 15, color: "var(--moss-600)" }}>
                {calculateBalance()} USDT
              </strong>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: 11, color: "var(--ash-500)" }}>
              Formula: Security Deposit + Payin - Payout
            </p>
          </div>
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
          <li>Agent code will be auto-generated (e.g., PV-X8TC2M)</li>
          <li>Password will be hashed securely</li>
          <li>Security deposit marks account as verified</li>
          <li>Wallet entries will be created for each transaction</li>
          <li>Agent can login immediately with email and password</li>
        </ul>
      </div>
    </div>
  );
}
