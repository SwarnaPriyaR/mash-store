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
  const [selectedGender, setSelectedGender] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  const ageGroups = ["All", "2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"];
  const genders = ["All", "Girls", "Boys", "Unisex"];
  const categories = ["All", "Dresses & Frocks", "Sets & Suits", "Dungarees & Overalls", "Tops & Tees"];

  const filtered = initialProducts.filter((p) => {
    const matchAge = selectedAge === "All" || (p.sizes && p.sizes.includes(selectedAge));
    const matchGender =
      selectedGender === "All" ||
      p.tags?.some((t) => t.toLowerCase() === selectedGender.toLowerCase()) ||
      p.name.toLowerCase().includes(selectedGender.toLowerCase());
    const matchCategory =
      selectedCategory === "All" ||
      p.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase().split(" ")[0])) ||
      p.name.toLowerCase().includes(selectedCategory.toLowerCase().split(" ")[0]);

    return matchAge && matchGender && matchCategory;
  });

  return (
    <div
      style={{
        background: "#99c8ec",
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 64,
        fontFamily: "'Lato', 'Open Sans', 'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* FLOATING HEADER & FILTERS */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              {/* BRAND LOGO: Custom Brand Display Style */}
              <div
                style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', cursive, sans-serif",
                  fontSize: 28,
                  letterSpacing: "0.08em",
                  color: "#1a1714",
                  fontStyle: "italic",
                }}
              >
                HOPSCOTCH · MASH KIDS
              </div>

              {/* MAIN PAGE TITLE: Semi-Bold / Regular ~24px */}
              <h1
                style={{
                  fontFamily: "'Lato', 'Open Sans', sans-serif",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#1a1714",
                  margin: "4px 0 0 0",
                }}
              >
                Baby & Kids Clothing
              </h1>
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                background: "#f6b8c1",
                color: "#1a1714",
                padding: "8px 16px",
                borderRadius: 99,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              🚚 Free Shipping on orders above ₹999
            </div>
          </div>

          {/* FLOATING FILTERS (NO BOX CONTAINER) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* AGE / SIZE FILTER */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", minWidth: 90, textTransform: "uppercase" }}>
                Age / Size:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ageGroups.map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setSelectedAge(age)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      border: selectedAge === age ? "2px solid #1a1714" : "1.5px solid #ffffff",
                      background: selectedAge === age ? "#1a1714" : "#ffffff",
                      color: selectedAge === age ? "#ffffff" : "#1a1714",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* GENDER FILTER */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1714", minWidth: 90, textTransform: "uppercase" }}>
                Gender:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {genders.map((gen) => (
                  <button
                    key={gen}
                    type="button"
                    onClick={() => setSelectedGender(gen)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      border: selectedGender === gen ? "2px solid #1a1714" : "1.5px solid #ffffff",
                      background: selectedGender === gen ? "#1a1714" : "#f6b8c1",
                      color: selectedGender === gen ? "#ffffff" : "#1a1714",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {gen === "Girls" ? "🎀 Girls" : gen === "Boys" ? "🧢 Boys" : gen === "Unisex" ? "✨ Unisex" : "All"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filtered.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "48px 24px", borderRadius: 20, textAlign: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1a1714" }}>No products match your selected filter</h3>
            <button
              type="button"
              onClick={() => { setSelectedAge("All"); setSelectedGender("All"); setSelectedCategory("All"); }}
              style={{ padding: "10px 20px", background: "#1a1714", color: "#fff", borderRadius: 99, border: "none", fontWeight: 600, marginTop: 12, cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {filtered.map((p) => {
              const discountPercent = isSaleOn ? sale.discount : 25; // Default 25% discount for visual appeal if sale inactive
              const originalPrice = p.basePrice;
              const price = Math.round(originalPrice * (1 - discountPercent / 100));
              const currentSize = selectedSizes[p.id] || p.sizes?.[0] || "2–3 Years";

              return (
                <div
                  key={p.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "4/5", background: "#f7fafc", overflow: "hidden" }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    {/* DISCOUNT PERCENTAGE: Regular / Medium, Green Accent Color */}
                    <span
                      style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        background: "#ffffff",
                        color: "#16a34a",
                        fontWeight: 600,
                        fontSize: 12,
                        padding: "4px 10px",
                        borderRadius: 99,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    >
                      {discountPercent}% OFF
                    </span>

                    <button
                      type="button"
                      className="icon-btn"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(255,255,255,0.9)",
                        border: "none",
                        color: wishlist.includes(p.id) ? "#e53e3e" : "#888",
                        borderRadius: 99,
                        width: 34,
                        height: 34,
                        cursor: "pointer",
                      }}
                      onClick={() => toggleWishlist(p as unknown as Product)}
                    >
                      <Icon.Heart filled={wishlist.includes(p.id)} />
                    </button>
                  </div>

                  {/* PRODUCT CARD BODY */}
                  <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      {/* PRODUCT TITLES: Primary Sans-Serif, Regular / Medium ~14px */}
                      <h3
                        style={{
                          fontFamily: "'Lato', 'Open Sans', sans-serif",
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#2d3748",
                          margin: "0 0 8px 0",
                          lineHeight: 1.35,
                        }}
                      >
                        {p.name}
                      </h3>

                      {/* AGE SIZE BADGES */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        {(p.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"]).map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: sz }))}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 6,
                              border: currentSize === sz ? "1.5px solid #1a1714" : "1px solid #e2e8f0",
                              background: currentSize === sz ? "#1a1714" : "#f7fafc",
                              color: currentSize === sz ? "#ffffff" : "#4a5568",
                              fontSize: 11,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* PRICING ROW */}
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        {/* DISCOUNTED PRICE: Bold, Dark/Primary Color */}
                        <span
                          style={{
                            fontFamily: "'Lato', 'Open Sans', sans-serif",
                            fontSize: 18,
                            fontWeight: 700,
                            color: "#1a1714",
                          }}
                        >
                          ₹{price}
                        </span>

                        {/* ORIGINAL PRICE: Light / Regular, Strikethrough, Muted Gray */}
                        <span
                          style={{
                            fontFamily: "'Lato', 'Open Sans', sans-serif",
                            fontSize: 13,
                            fontWeight: 400,
                            textDecoration: "line-through",
                            color: "#718096",
                          }}
                        >
                          ₹{originalPrice}
                        </span>

                        {/* DISCOUNT PERCENTAGE: Green Accent */}
                        <span
                          style={{
                            fontFamily: "'Lato', 'Open Sans', sans-serif",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#16a34a",
                          }}
                        >
                          ({discountPercent}% off)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart({
                            ...(p as unknown as Product),
                            price,
                            name: `${p.name} (${currentSize})`,
                          })
                        }
                        style={{
                          width: "100%",
                          marginTop: 10,
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#1a1714",
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: "pointer",
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
        )}
      </div>
    </div>
  );
}
