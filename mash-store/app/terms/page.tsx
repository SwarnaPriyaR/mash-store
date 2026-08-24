import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — MASH Store",
  description: "MASH Store Terms and Conditions",
};

export default function TermsPage() {
  return (
    <div className="products-page" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <h1 className="products-title" style={{ fontSize: 36, marginBottom: 16 }}>
        TERMS OF SERVICE
      </h1>
      <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14 }}>
        Last Updated: August 2026
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--text)", lineHeight: 1.7, fontSize: 14 }}>
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. Acceptable Use</h2>
          <p>
            By using MASH Store, you agree to provide accurate order information and comply with all applicable online purchasing policies.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. Orders & Payments</h2>
          <p>
            All streetwear and kids apparel orders are processed based on available inventory. Prices and active flash discounts are displayed transparently before checkout.
          </p>
        </section>
      </div>
    </div>
  );
}
