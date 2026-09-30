"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginView() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0e2a1a 0%, #1a4d2e 100%)",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "#fff",
        borderRadius: "16px",
        padding: "40px 32px",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)"
      }}>
        {/* Logo */}
        <div style={{
          textAlign: "center",
          marginBottom: "32px"
        }}>
          <div style={{
            width: "64px",
            height: "64px",
            margin: "0 auto 16px",
            background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: "700",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)"
          }}>
            FN
          </div>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#1a202c",
            marginBottom: "8px"
          }}>
            FNG<span style={{ color: "#10B981" }}>PAY</span>
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#718096",
            letterSpacing: "0.08em"
          }}>
            ADMIN PANEL
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {error && (
            <div style={{
              padding: "12px 16px",
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: "8px",
              color: "#991B1B",
              fontSize: "14px",
              marginBottom: "20px"
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "2px solid #E5E7EB",
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#10B981"}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
              marginBottom: "8px"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "2px solid #E5E7EB",
                borderRadius: "8px",
                outline: "none",
                transition: "border-color 0.2s",
                fontFamily: "inherit"
              }}
              onFocus={(e) => e.target.style.borderColor = "#10B981"}
              onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              fontWeight: "600",
              color: "#fff",
              background: loading ? "#9CA3AF" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              border: "none",
              borderRadius: "8px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s, box-shadow 0.2s",
              boxShadow: loading ? "none" : "0 4px 12px rgba(16, 185, 129, 0.4)"
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(16, 185, 129, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.4)";
              }
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "12px",
          color: "#9CA3AF"
        }}>
          Admin access only • Secure login
        </div>
      </div>

      {/* Mobile responsive styles */}
      <style jsx>{`
        @media (max-width: 480px) {
          div {
            padding: 32px 24px !important;
          }
        }
      `}</style>
    </div>
  );
}
