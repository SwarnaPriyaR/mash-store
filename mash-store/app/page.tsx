// app/page.tsx — Home Page (Server Component)
// No HTTP fetch, no useEffect — pure JSX rendered on the server.

import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MASH Store — Premium Streetwear",
  description:
    "Premium T-shirts crafted for those who refuse to blend in. Heavyweight cotton, bold graphics, zero compromise.",
};

export default function HomePage() {
  return (
    <div className="hero" style={{ paddingTop: 64 }}>
      <div className="hero-bg-text">MASH</div>
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span>✦</span> New Collection 2026
        </div>
        <h1 className="hero-title">
          WEAR YOUR
          <br />
          <span>ATTITUDE</span>
        </h1>
        <p className="hero-sub">
          Premium T-shirts crafted for those who refuse to blend in. Heavyweight
          cotton, bold graphics, zero compromise.
        </p>
        <Link href="/products" className="cta-btn" style={{ textDecoration: "none" }}>
          View Products →
        </Link>
        <div className="hero-strips">
          {["Free Shipping Above ₹999", "100% Cotton", "6 Signature Styles"].map(
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
