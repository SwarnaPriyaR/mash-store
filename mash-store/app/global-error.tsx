"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#141210",
          color: "#f0ebe3",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: 32, margin: "0 0 12px 0" }}>PAGE NOT FOUND OR SYSTEM EXCEPTION</h1>
          <p style={{ color: "#9e9288", maxWidth: 440, margin: "0 auto 24px" }}>
            A system exception occurred. The store remains operational — click below to retry.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              borderRadius: 99,
              border: "none",
              background: "#e8603e",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry Loading Page
          </button>
        </div>
      </body>
    </html>
  );
}
