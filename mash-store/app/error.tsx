"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application exception caught by Error Boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        paddingTop: 120,
        paddingBottom: 80,
        minHeight: "75vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        paddingLeft: 24,
        paddingRight: 24,
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🔎</div>
      <h1
        style={{
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          fontSize: 42,
          margin: "0 0 12px 0",
          letterSpacing: "0.04em",
        }}
      >
        PAGE NOT FOUND OR UNEXPECTED ERROR
      </h1>
      <p style={{ maxWidth: 460, color: "var(--text2)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
        We encountered a temporary exception while rendering this section. No need to worry — your session and cart remain safe!
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "12px 24px",
            borderRadius: 99,
            border: "none",
            background: "var(--accent)",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          🔄 Try Reloading Page
        </button>
        <Link
          href="/"
          style={{
            padding: "12px 24px",
            borderRadius: 99,
            border: "1px solid var(--border)",
            background: "var(--bg2)",
            color: "var(--text)",
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          🏠 Back to Home
        </Link>
      </div>
    </div>
  );
}
