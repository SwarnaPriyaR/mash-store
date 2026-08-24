// app/page.tsx — Home Page (Server Component)

import Link from "next/link";
import { HomePageClient } from "./HomePageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Wear Your Attitude",
};

export default function HomePage() {
  return (
    <div className="hero">
      <HomePageClient />
      <div className="hero-bg-text">MASH</div>
      <div className="hero-content">
        <div className="hero-eyebrow">
          New Collection 2026
        </div>
        <h1 className="hero-title">
          WEAR YOUR
          <br />
          <span>ATTITUDE</span>
        </h1>
        <p className="hero-sub">
          Premium T-shirts crafted for those who refuse to blend in.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/products" className="cta-btn" style={{ textDecoration: "none" }}>
            All Drops
          </Link>
          <Link
            href="/kids"
            className="cta-btn"
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.35)",
            }}
          >
            Go Kids
          </Link>
        </div>
        <div className="hero-strips">
          {["100% Cotton", "No COD"].map(
            (s) => (
              <div className="strip" key={s}>
                <div className="strip-dot" />
                {s}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
