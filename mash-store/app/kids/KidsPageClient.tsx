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
        background: "#ffdbdb",
        minHeight: "100vh",
        paddingTop: 80,
        paddingBottom: 64,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* HOPSCOTCH-STYLE STICKY/TOP FILTER HEADER BAR (#fcc3c3) */}
      <div
        style={{
          background: "#fcc3c3",
          borderBottom: "2px solid #f6a2a2",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          padding: "20px 24px",
          marginBottom: 32,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                  fontSize: 36,
                  color: "#1a1714",
                  margin: 0,
                  letterSpacing: "0.04em",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                MASH KIDS STORE
              </h1>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3c3c" }}>
                Showing {filtered.length} adorable styles for ages 2 to 9
              </span>
            </div>

            <div style={{ fontSize: 13, fontWeight: 700, background: "#ffffff", padding: "6px 14px", borderRadius: 99, color: "#1a1714", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              🚚 Free Shipping above ₹999
            </div>
          </div>

          {/* HOPSCOTCH FILTERS BAR: AGE / SIZE, GENDER, CATEGORY */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              background: "#ffffff",
              borderRadius: 16,
              padding: "16px 20px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
              border: "1.5px solid #f6a2a2",
            }}
          >
            {/* 1. FILTER BY AGE / SIZE */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1714", minWidth: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Age / Size:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ageGroups.map((age) => (
                  <button
                    key={age}
                    onClick={() => setSelectedAge(age)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      border: selectedAge === age ? "2px solid #1a1714" : "1.5px solid #e2e8f0",
                      background: selectedAge === age ? "#1a1714" : "#ffdbdb",
                      color: selectedAge === age ? "#ffffff" : "#1a1714",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. FILTER BY GENDER */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1714", minWidth: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Gender:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {genders.map((gen) => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGender(gen)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      border: selectedGender === gen ? "2px solid #1a1714" : "1.5px solid #e2e8f0",
                      background: selectedGender === gen ? "#1a1714" : "#ffffff",
                      color: selectedGender === gen ? "#ffffff" : "#1a1714",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {gen === "Girls" ? "🎀 Girls" : gen === "Boys" ? "🧢 Boys" : gen === "Unisex" ? "✨ Unisex" : "All"}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. FILTER BY OUTFIT CATEGORY */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1a1714", minWidth: 100, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Category:
              </span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 99,
                      border: selectedCategory === cat ? "2px solid #1a1714" : "1.5px solid #e2e8f0",
                      background: selectedCategory === cat ? "#1a1714" : "#ffdbdb",
                      color: selectedCategory === cat ? "#ffffff" : "#1a1714",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS GRID SECTION ABOVE #ffdbdb BACKGROUND */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {filtered.length === 0 ? (
          <div style={{ background: "#ffffff", padding: "48px 24px", borderRadius: 20, textAlign: "center", border: "2px solid #f6a2a2" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#1a1714" }}>No kids products match your filter</h3>
            <p style={{ color: "#666", fontSize: 14 }}>Try clearing some filters to see all available outfits.</p>
            <button
              onClick={() => { setSelectedAge("All"); setSelectedGender("All"); setSelectedCategory("All"); }}
              style={{ padding: "10px 20px", background: "#1a1714", color: "#fff", borderRadius: 99, border: "none", fontWeight: 700, marginTop: 12, cursor: "pointer" }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
            {filtered.map((p) => {
              const price = isSaleOn ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice;
              const onSale = isSaleOn && price < p.basePrice;
              const currentSize = selectedSizes[p.id] || p.sizes?.[0] || "2–3 Years";

              return (
                <div
                  key={p.id}
                  style={{
                    background: "#ffffff",
                    borderRadius: 20,
                    border: "2px solid #fcc3c3",
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "4/5", background: "#fff5f5", overflow: "hidden" }}>
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />

                    <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6 }}>
                      <span style={{ background: "#fcc3c3", color: "#1a1714", fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 99 }}>
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
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                      onClick={() => toggleWishlist(p as unknown as Product)}
                    >
                      <Icon.Heart filled={wishlist.includes(p.id)} />
                    </button>
                  </div>

                  {/* CARD DETAILS */}
                  <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 800, color: "#1a1714", margin: "0 0 8px 0" }}>{p.name}</h3>

                      {/* AGE / SIZE BADGES */}
                      <div style={{ margin: "10px 0" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", marginBottom: 6 }}>
                          Select Size (Age):
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {(p.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"]).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => setSelectedSizes({ ...selectedSizes, [p.id]: sz })}
                              style={{
                                padding: "4px 10px",
                                borderRadius: 8,
                                border: currentSize === sz ? "1.5px solid #1a1714" : "1px solid #e2e8f0",
                                background: currentSize === sz ? "#1a1714" : "#ffdbdb",
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
                    <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 24, color: "#1a1714", margin: 0 }}>
                          ₹{price}
                        </div>
                        {onSale && <span style={{ fontSize: 12, color: "#888", textDecoration: "line-through" }}>₹{p.basePrice}</span>}
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
                          padding: "10px 18px",
                          borderRadius: 12,
                          border: "none",
                          background: "#1a1714",
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
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
        )}
      </div>
    </div>
  );
}
