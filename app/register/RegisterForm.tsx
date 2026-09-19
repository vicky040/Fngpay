"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "../components/Icon";
import { Checkbox } from "../components/Checkbox";

type FieldSpec = {
  key: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  type?: string;
  mono?: boolean;
  placeholder: string;
};

const SECTIONS: { label: string; fields: FieldSpec[] }[] = [
  {
    label: "Identity",
    fields: [
      { key: "fullName", label: "Full Name", required: true, placeholder: "Full name as per records" },
      { key: "agentCode", label: "Agent ID / Agent Code", required: true, mono: true, placeholder: "PV-XXXX-XXXX" },
      { key: "email", label: "Email Address", required: true, type: "email", placeholder: "name@company.com" },
      { key: "setupCode", label: "Setup Code (admin-provisioned accounts)", optional: true, mono: true, placeholder: "8-character code from FNGPAY" },
    ],
  },
  {
    label: "Contact",
    fields: [
      { key: "mobile", label: "Mobile Number", required: true, mono: true, placeholder: "10-digit mobile" },
      { key: "telegramId", label: "Telegram ID", required: true, placeholder: "@username" },
    ],
  },
  {
    label: "Credentials",
    fields: [
      { key: "password", label: "Login Password", required: true, type: "password", placeholder: "••••••••" },
      { key: "confirmPassword", label: "Confirm Login Password", required: true, type: "password", placeholder: "••••••••" },
      { key: "pin", label: "Transaction PIN", required: true, mono: true, placeholder: "4-6 digits" },
      { key: "confirmPin", label: "Confirm Transaction PIN", required: true, mono: true, placeholder: "4-6 digits" },
    ],
  },
];

const INITIAL = {
  fullName: "",
  agentCode: "",
  email: "",
  setupCode: "",
  mobile: "",
  telegramId: "",
  password: "",
  confirmPassword: "",
  pin: "",
  confirmPin: "",
};

export function RegisterForm() {
  const router = useRouter();
  const [values, setValues] = useState(INITIAL);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!agreed) {
      setError("You must agree to the Privacy Policy and Terms & Conditions to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        setSubmitting(false);
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Is the app running?");
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-head-icon">
          <div className="card-icon-tile">
            <Icon name="user" />
          </div>
          <div>
            <div className="card-head-title">Create your FNGPAY account</div>
            <div className="card-head-sub">
              Use the Agent ID issued through official Telegram onboarding. Admin-provisioned accounts also need the Setup Code shared by
              FNGPAY.
            </div>
          </div>
          <div className="card-head-meta">* required</div>
        </div>

        <div className="card-body">
          <form id="register-form" onSubmit={onSubmit}>
            {SECTIONS.map((section) => (
              <div key={section.label}>
                <div className="sec-label-form">
                  <Icon name="info" />
                  {section.label}
                </div>
                {section.fields.map((field) => (
                  <div className="form-row c1" key={field.key}>
                    <div className="field">
                      <label className="field-label" htmlFor={field.key}>
                        {field.label}
                        {field.required ? <span className="req"> *</span> : null}
                        {field.optional ? <span className="opt"> (optional)</span> : null}
                      </label>
                      <input
                        id={field.key}
                        name={field.key}
                        type={field.type ?? "text"}
                        className={`input${field.mono ? " mono" : ""}`}
                        placeholder={field.placeholder}
                        required={field.required}
                        value={values[field.key as keyof typeof values]}
                        onChange={(e) => setField(field.key, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}

            {error ? <div className="field-error">{error}</div> : null}
          </form>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "0 2px", marginTop: 16 }}>
        <Checkbox onCheckedChange={setAgreed}>I agree to the Privacy Policy and Terms &amp; Conditions.</Checkbox>
        <button type="submit" form="register-form" className="btn-primary" style={{ width: "100%", height: 44, fontSize: 14 }} disabled={submitting}>
          {submitting ? "Creating account…" : "Continue to Authenticator Setup"}
        </button>
        <div style={{ textAlign: "center", fontSize: 13, color: "var(--ash-600)" }}>
          Don&apos;t have an Agent ID?{" "}
          <a href="/api/telegram/start" style={{ color: "var(--moss-600)", fontWeight: 500 }}>
            Get it now
          </a>
        </div>
        <Link href="/login" style={{ textAlign: "center", fontSize: 13, color: "var(--ash-600)" }}>
          Already registered? <span style={{ color: "var(--moss-600)", fontWeight: 500 }}>Login</span>
        </Link>
      </div>
    </>
  );
}
