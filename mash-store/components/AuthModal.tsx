"use client";

import { useEffect, useState } from "react";

interface Props {
  mode: "login" | "signup";
  onClose: () => void;
  onLogin: (name: string) => void;
  switchMode: (m: "login" | "signup") => void;
}

export function AuthModal({ mode, onClose, switchMode }: Props) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for OAuth error feedback
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("oauth_error");

    if (errorParam === "account_exists") {
      setErrorMessage("Account already exists. Please log in.");
    } else if (errorParam === "account_not_found") {
      setErrorMessage("No account found with this Google email. Please sign up first.");
    } else if (errorParam) {
      setErrorMessage("Authentication failed. Please try again.");
    }
  }, []);

  const handleGoogleOAuth = () => {
    window.location.href = `/api/auth/google?intent=${mode}`;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420, textAlign: "center", padding: "32px 28px" }}>
        <button className="modal-close" onClick={onClose}>×</button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--accent)", marginBottom: 4 }}>
            MASH STORE AUTHENTICATION
          </div>
          <h2 className="modal-title" style={{ fontSize: 24, margin: 0 }}>
            {mode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </h2>
          <p className="modal-sub" style={{ fontSize: 14, color: "var(--text2)", marginTop: 6 }}>
            {mode === "login"
              ? "Sign in using your Google Account"
              : "Sign up using your Google Account to manage orders & saved items"}
          </p>
        </div>

        {/* ERROR ALERT BANNER */}
        {errorMessage && (
          <div
            style={{
              background: "#fee2e2",
              border: "1.5px solid #ef4444",
              color: "#991b1b",
              padding: "10px 14px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 20,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ONLY GOOGLE OAUTH BUTTON */}
        <button
          type="button"
          onClick={handleGoogleOAuth}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "14px 20px",
            borderRadius: 12,
            border: "1.5px solid var(--border)",
            background: "var(--bg2)",
            color: "var(--text)",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            transition: "transform 0.15s, background-color 0.15s",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          {mode === "login" ? "Log in with Google" : "Sign up with Google"}
        </button>

        <div className="modal-switch" style={{ marginTop: 24 }}>
          {mode === "login" ? (
            <>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => { setErrorMessage(null); switchMode("signup"); }}
                style={{ fontWeight: 700, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
              >
                Sign up with Google
              </button>
            </>
          ) : (
            <>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => { setErrorMessage(null); switchMode("login"); }}
                style={{ fontWeight: 700, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
