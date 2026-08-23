"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import { getSizeStock } from "@/lib/helpers";
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
  const genders = ["All", "Girl", "Boy", "Unisex"];

  const filtered = initialProducts.filter((p) => {
    const matchAge = selectedAge === "All" || (p.sizes && p.sizes.includes(selectedAge));
    const matchGender =
      selectedGender === "All" ||
      p.tags?.some((t) => t.toLowerCase() === selectedGender.toLowerCase()) ||
      p.name.toLowerCase().includes(selectedGender.toLowerCase());

    return matchAge && matchGender;
  });

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 64,
        fontFamily: "'Lato', 'Open Sans', 'DM Sans', sans-serif",
        transition: "background-color 0.3s, color 0.3s",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* HEADER SECTION */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                  fontSize: 36,
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: 0,
                  letterSpacing: "0.04em",
                }}
              >
                MASH KIDS
              </h1>
              <p style={{ margin: "4px 0 0 0", color: "var(--text2)", fontSize: 14, fontWeight: 500 }}>
                Showing {filtered.length} styles for kids
              </p>
            </div>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                background: "var(--bg2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                padding: "8px 16px",
                borderRadius: 99,
              }}
            >
              🚚 Free Shipping on orders above ₹999
            </div>
          </div>

          {/* FLOATING FILTERS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* AGE / SIZE FILTER */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", minWidth: 90, textTransform: "uppercase" }}>
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
                      border: selectedAge === age ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: selectedAge === age ? "var(--accent)" : "var(--bg2)",
                      color: selectedAge === age ? "#ffffff" : "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* GENDER FILTER: Girl, Boy, Unisex */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", minWidth: 90, textTransform: "uppercase" }}>
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
                      border: selectedGender === gen ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                      background: selectedGender === gen ? "var(--accent)" : "var(--bg2)",
                      color: selectedGender === gen ? "#ffffff" : "var(--text)",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filtered.length === 0 ? (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "48px 24px", borderRadius: 16, textAlign: "center" }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text)" }}>No products available</h3>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>Add kids products from the Admin Portal to showcase them here.</p>
            <button
              type="button"
              onClick={() => { setSelectedAge("All"); setSelectedGender("All"); setSelectedCategory("All"); }}
              style={{ padding: "10px 20px", background: "var(--accent)", color: "#fff", borderRadius: 99, border: "none", fontWeight: 600, marginTop: 12, cursor: "pointer" }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 20 }}>
            {filtered.map((p) => {
              const price = isSaleOn ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice;
              const onSale = isSaleOn && price < p.basePrice;
              const sizeStockMap = getSizeStock(p);
              const availableSizes = p.sizes || ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"];

              // Determine if all sizes are out of stock
              const isAllOutOfStock = p.qty === 0 || availableSizes.every((sz) => (sizeStockMap[sz] ?? 0) <= 0);
              const currentSize = selectedSizes[p.id] || availableSizes.find((sz) => (sizeStockMap[sz] ?? 0) > 0) || availableSizes[0];

              return (
                <div
                  key={p.id}
                  style={{
                    background: "var(--card-bg, var(--bg2))",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ position: "relative", aspectRatio: "4/5", background: "var(--bg2)", overflow: "hidden" }}>
                    {/* PRODUCT IMAGE WITH BLUR IF ALL OUT OF STOCK */}
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        filter: isAllOutOfStock ? "blur(3.5px) grayscale(70%) opacity(0.7)" : "none",
                        transition: "filter 0.3s",
                      }}
                    />

                    {/* OUT OF STOCK BANNER / OVERLAY */}
                    {isAllOutOfStock ? (
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: 0,
                          right: 0,
                          transform: "translateY(-50%)",
                          background: "rgba(225, 29, 72, 0.92)",
                          color: "#ffffff",
                          fontWeight: 800,
                          fontSize: 13,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          textAlign: "center",
                          padding: "8px 0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        }}
                      >
                        OUT OF STOCK
                      </div>
                    ) : onSale ? (
                      <span
                        style={{
                          position: "absolute",
                          top: 10,
                          left: 10,
                          background: "#e53e3e",
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: 12,
                          padding: "4px 10px",
                          borderRadius: 99,
                        }}
                      >
                        {sale.discount}% OFF
                      </span>
                    ) : null}

                    <button
                      type="button"
                      className="icon-btn"
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: wishlist.includes(p.id) ? "#e53e3e" : "var(--text2)",
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
                      <h3
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "var(--text)",
                          margin: "0 0 8px 0",
                          lineHeight: 1.35,
                        }}
                      >
                        {p.name}
                      </h3>

                      {/* AGE SIZE BADGES WITH PER-SIZE STOCK CROSS OUT */}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        {availableSizes.map((sz) => {
                          const sizeQty = sizeStockMap[sz] ?? 0;
                          const isSizeOutOfStock = isAllOutOfStock || sizeQty <= 0;

                          return (
                            <button
                              key={sz}
                              type="button"
                              disabled={isSizeOutOfStock}
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: sz }))}
                              style={{
                                padding: "3px 8px",
                                borderRadius: 6,
                                border: currentSize === sz && !isSizeOutOfStock ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                                background: isSizeOutOfStock
                                  ? "var(--bg2)"
                                  : currentSize === sz
                                  ? "var(--accent)"
                                  : "var(--bg)",
                                color: isSizeOutOfStock
                                  ? "var(--text2)"
                                  : currentSize === sz
                                  ? "#ffffff"
                                  : "var(--text)",
                                fontSize: 11,
                                fontWeight: 500,
                                textDecoration: isSizeOutOfStock ? "line-through" : "none",
                                opacity: isSizeOutOfStock ? 0.45 : 1,
                                cursor: isSizeOutOfStock ? "not-allowed" : "pointer",
                              }}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* PRICING & ADD TO CART */}
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: "var(--text)",
                          }}
                        >
                          ₹{price}
                        </span>

                        {onSale && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 400,
                              textDecoration: "line-through",
                              color: "var(--text2)",
                            }}
                          >
                            ₹{p.basePrice}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={isAllOutOfStock}
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
                          background: isAllOutOfStock ? "var(--border)" : "var(--text)",
                          color: isAllOutOfStock ? "var(--text2)" : "var(--bg)",
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: isAllOutOfStock ? "not-allowed" : "pointer",
                        }}
                      >
                        {isAllOutOfStock ? "Out of Stock" : "+ Add to Cart"}
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
