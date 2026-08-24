"use client";

import { useEffect, useState } from "react";

export function HomePageClient() {
  const [accountExistsAlert, setAccountExistsAlert] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("oauth_error") === "account_exists") {
      setAccountExistsAlert(true);
      // Auto-dismiss notification after 10 seconds
      const timer = setTimeout(() => {
        setAccountExistsAlert(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!accountExistsAlert) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "90%",
        maxWidth: 560,
        background: "#fee2e2",
        border: "2px solid #ef4444",
        color: "#991b1b",
        padding: "14px 20px",
        borderRadius: 14,
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        animation: "toastIn 0.3s ease-out",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Account Already Exists!</div>
          <div style={{ fontSize: 13, marginTop: 2 }}>
            An account with this Google email already exists. Please click <strong>Log In</strong> to sign in.
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setAccountExistsAlert(false)}
        style={{
          background: "none",
          border: "none",
          color: "#991b1b",
          fontSize: 20,
          fontWeight: 700,
          cursor: "pointer",
          padding: "0 4px",
        }}
      >
        ×
      </button>
    </div>
  );
}
