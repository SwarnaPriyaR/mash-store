import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MASH Store",
  description: "MASH Store Privacy Policy and Data Usage Information",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="products-page" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 64 }}>
      <h1 className="products-title" style={{ fontSize: 36, marginBottom: 16 }}>
        PRIVACY POLICY
      </h1>
      <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14 }}>
        Last Updated: August 2026
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "var(--text)", lineHeight: 1.7, fontSize: 14 }}>
        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>1. Information We Collect</h2>
          <p>
            When you sign in or create an account at MASH Store, we collect basic profile details including your name and email address to manage your shopping account and order history.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>2. How We Use Your Information</h2>
          <p>
            Your information is used strictly to process orders, manage your shopping cart, display your order history, and communicate order delivery status updates.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>3. Data Protection & Sharing</h2>
          <p>
            MASH Store does not sell, rent, or trade your personal data to third parties. All authentication data is encrypted and securely managed.
          </p>
        </section>
      </div>
    </div>
  );
}
