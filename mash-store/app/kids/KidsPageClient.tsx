"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import type { Product } from "@/lib/db";

interface Props {
  initialProducts: Product[];
}

export function KidsPageClient({ initialProducts }: Props) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { sale } = useSale();
  const [filterFit, setFilterFit] = useState("All");

  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  const fits = ["All", "Regular", "Oversized"];
  const filtered = filterFit === "All"
    ? initialProducts
    : initialProducts.filter(p => p.fit === filterFit);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", paddingTop: 96, paddingBottom: 64 }}>
      {/* HERO BANNER FOR KIDS */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto 40px",
          padding: "36px 32px",
          borderRadius: 24,
          background: "linear-gradient(135deg, #ff70a6 0%, #ff9770 30%, #ffd670 60%, #e9ff70 100%)",
          boxShadow: "0 12px 32px rgba(255, 112, 166, 0.25)",
          color: "#1a1714",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#1a1714",
              color: "#fff",
              padding: "6px 16px",
              borderRadius: 99,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            <span>🎈</span> MASH KIDS COLLECTION
          </div>

          <h1
            style={{
              fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 8vw, 84px)",
              lineHeight: 0.95,
              margin: 0,
              color: "#1a1714",
              textShadow: "2px 2px 0px rgba(255,255,255,0.8)",
            }}
          >
            MASH KIDS 🎨✨
          </h1>

          <p style={{ fontSize: 16, fontWeight: 500, color: "#2d2823", maxWidth: 520, marginTop: 12, lineHeight: 1.6 }}>
            Super fun, colorful, and extra durable outfits designed for energetic kids! Premium soft cotton for all-day comfort.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -40, right: 120, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.25)", pointerEvents: "none" }} />
      </div>

      {/* FILTER & HEADER SECTION */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 36, margin: 0, letterSpacing: "0.04em" }}>
              EXPLORE KIDS DRESSES ({filtered.length})
            </h2>
            <p style={{ color: "var(--text2)", fontSize: 14, margin: "4px 0 0" }}>
              Bright colors, playful fits, and 100% skin-safe cotton.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {fits.map(f => (
              <button
                key={f}
                className={`fit-chip ${filterFit === f ? "active" : ""}`}
                onClick={() => setFilterFit(f)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 99,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="product-grid">
          {filtered.map(p => {
            const price = isSaleOn ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice;
            const onSale = isSaleOn && price < p.basePrice;

            return (
              <div
                key={p.id}
                className={`product-card ${p.qty === 0 ? "oos" : ""}`}
                style={{
                  borderRadius: 16,
                  border: "2px solid var(--border)",
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <div className="product-img-wrap" style={{ position: "relative" }}>
                  <img src={p.image} alt={p.name} className="product-img" loading="lazy" />

                  <div className="product-tags">
                    <span className="product-tag" style={{ background: "#ec4899", color: "#fff" }}>Kids</span>
                    {onSale && <span className="sale-tag">{sale.discount}% OFF</span>}
                    {p.qty === 0 && <span className="oos-tag">Out of Stock</span>}
                  </div>

                  <button
                    className="icon-btn"
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      color: wishlist.includes(p.id) ? "#ec4899" : "#888",
                    }}
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                  >
                    <Icon.Heart filled={wishlist.includes(p.id)} />
                  </button>
                </div>

                <div className="product-info" style={{ padding: "16px 20px 20px" }}>
                  <div>
                    <div className="product-name" style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "#8b5cf6", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>
                      {p.fit} Fit · Kids Special
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="price-row">
                      <span className="product-price" style={{ fontSize: 24, color: "var(--accent)" }}>
                        ₹{price}
                      </span>
                      {onSale && <span className="product-price-orig">₹{p.basePrice}</span>}
                    </div>

                    <Link
                      href={`/product/${p.id}`}
                      style={{
                        padding: "8px 16px",
                        borderRadius: 8,
                        background: "var(--accent)",
                        color: "#fff",
                        textDecoration: "none",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
