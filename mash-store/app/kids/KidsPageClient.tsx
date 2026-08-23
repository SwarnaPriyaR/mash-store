"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import type { KidsProduct, Product } from "@/lib/db";

interface Props {
  initialProducts: KidsProduct[];
}

export function KidsPageClient({ initialProducts }: Props) {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { sale } = useSale();
  const [selectedAge, setSelectedAge] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  const ageGroups = ["All", "2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"];

  const filtered = selectedAge === "All"
    ? initialProducts
    : initialProducts.filter((p) => p.sizes?.includes(selectedAge));

  return (
    <div
      style={{
        background: "#99c8ec",
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 64,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* HOPSCOTCH INSPIRED MASH KIDS BANNER */}
      <div style={{ maxWidth: 1140, margin: "0 auto 32px", padding: "0 24px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #ffe5ec 50%, #f6b8c1 100%)",
            borderRadius: 24,
            padding: "36px 40px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            border: "3px solid #ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <span
              style={{
                display: "inline-block",
                background: "#f6b8c1",
                color: "#1a1714",
                fontWeight: 800,
                fontSize: 12,
                padding: "6px 14px",
                borderRadius: 99,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Shop By Age · 2 to 9 Years
            </span>

            <h1
              style={{
                fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                fontSize: "clamp(42px, 7vw, 76px)",
                color: "#1a1714",
                margin: 0,
                lineHeight: 0.95,
                letterSpacing: "0.02em",
              }}
            >
              MASH KIDS
            </h1>

            <p style={{ color: "#4a4238", fontSize: 16, fontWeight: 500, marginTop: 10, maxWidth: 500, lineHeight: 1.5 }}>
              Softest organic cotton, ultra-comfortable stitching, and cute everyday styles crafted for little smiles.
            </p>

            {/* AGE QUICK FILTER CHIPS */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 700, alignSelf: "center", color: "#1a1714", marginRight: 4 }}>
                Filter Age:
              </span>
              {ageGroups.map((age) => (
                <button
                  key={age}
                  onClick={() => setSelectedAge(age)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: 99,
                    border: "2px solid #ffffff",
                    background: selectedAge === age ? "#1a1714" : "#ffffff",
                    color: selectedAge === age ? "#ffffff" : "#1a1714",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {age}
                </button>
              ))}
            </div>
          </div>

          {/* Background decorative circles */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", bottom: -50, right: 100, width: 160, height: 160, borderRadius: "50%", background: "rgba(246, 184, 193, 0.5)" }} />
        </div>
      </div>

      {/* PRODUCTS SECTION */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <h2 style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 32, color: "#1a1714", margin: 0, letterSpacing: "0.04em" }}>
            KIDS COLLECTION ({filtered.length})
          </h2>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#2d3748" }}>Free shipping on orders above ₹999</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {filtered.map((p) => {
            const price = isSaleOn ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice;
            const onSale = isSaleOn && price < p.basePrice;
            const currentSize = selectedSizes[p.id] || p.sizes?.[0] || "2–3 Years";

            return (
              <div
                key={p.id}
                style={{
                  background: "#f6b8c1",
                  borderRadius: 20,
                  border: "3px solid #ffffff",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                <div style={{ position: "relative", aspectRatio: "4/5", background: "#ffffff", overflow: "hidden" }}>
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />

                  <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                    <span style={{ background: "#ffffff", color: "#1a1714", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 99, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                      KIDS
                    </span>
                    {onSale && (
                      <span style={{ background: "#e53e3e", color: "#fff", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 99 }}>
                        {sale.discount}% OFF
                      </span>
                    )}
                  </div>

                  <button
                    className="icon-btn"
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "rgba(255,255,255,0.9)",
                      border: "none",
                      color: wishlist.includes(p.id) ? "#e53e3e" : "#888",
                      borderRadius: 99,
                      width: 36,
                      height: 36,
                    }}
                    onClick={() => toggleWishlist(p as unknown as Product)}
                  >
                    <Icon.Heart filled={wishlist.includes(p.id)} />
                  </button>
                </div>

                {/* CARD BODY IN #f6b8c1 */}
                <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: "#1a1714", margin: "0 0 6px 0" }}>{p.name}</h3>

                    {/* SIZE SELECTOR BADGES */}
                    <div style={{ margin: "10px 0" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#4a4238", textTransform: "uppercase", marginBottom: 6 }}>
                        Available Sizes:
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(p.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"]).map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setSelectedSizes({ ...selectedSizes, [p.id]: sz })}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 8,
                              border: "1.5px solid #ffffff",
                              background: currentSize === sz ? "#1a1714" : "#ffffff",
                              color: currentSize === sz ? "#ffffff" : "#1a1714",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* PRICE & ADD TO CART */}
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 24, color: "#1a1714", margin: 0 }}>
                        ₹{price}
                      </div>
                      {onSale && <span style={{ fontSize: 12, color: "#666", textDecoration: "line-through" }}>₹{p.basePrice}</span>}
                    </div>

                    <button
                      onClick={() =>
                        addToCart({
                          ...(p as unknown as Product),
                          price,
                          name: `${p.name} (${currentSize})`,
                        })
                      }
                      style={{
                        marginLeft: "auto",
                        padding: "10px 18px",
                        borderRadius: 12,
                        border: "none",
                        background: "#1a1714",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: "transform 0.15s",
                      }}
                    >
                      + Add to Cart
                    </button>
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
