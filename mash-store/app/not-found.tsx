import Link from "next/link";

export default function NotFound() {
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
      <div style={{ fontSize: 64, marginBottom: 12, fontWeight: 900, color: "var(--accent)" }}>404</div>
      <h1
        style={{
          fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
          fontSize: 42,
          margin: "0 0 12px 0",
          letterSpacing: "0.04em",
        }}
      >
        PAGE NOT FOUND
      </h1>
      <p style={{ maxWidth: 440, color: "var(--text2)", fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
        The page or product you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: "12px 28px",
          borderRadius: 99,
          border: "none",
          background: "var(--accent)",
          color: "#ffffff",
          fontWeight: 700,
          fontSize: 14,
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        🏠 Back to MASH Home
      </Link>
    </div>
  );
}
