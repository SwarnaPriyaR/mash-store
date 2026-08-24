"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import { convertDriveUrl, getSizeStock } from "@/lib/helpers";
import type { Product } from "@/lib/db";

export function ProductsClient() {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { sale } = useSale();
  const [products, setProducts] = useState<(Product & { price: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetch("/api/product/allProduct")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(
          data.map((p) => ({
            ...p,
            price: p.basePrice,
            image: convertDriveUrl(p.image),
          }))
        );
      })
      .catch(() => setError("Could not load products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sale.active) return;
    setProducts((prev) =>
      prev.map((p) => {
        const now = Date.now();
        if (sale.active && now >= sale.start && now <= sale.end) {
          return { ...p, price: Math.round(p.basePrice * (1 - sale.discount / 100)) };
        }
        return { ...p, price: p.basePrice };
      })
    );
  }, [sale]);

  const categories = ["All", "Men", "Women", "Unisex"];

  const filtered = products.filter((p) => {
    const matchCategory =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
      p.tags?.some((t) => t.toLowerCase() === categoryFilter.toLowerCase());
    return matchCategory;
  });

  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  if (loading) {
    return (
      <div className="products-page" style={{ paddingTop: 96, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div className="spinner" style={{ width: 48, height: 48, border: "4px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page" style={{ paddingTop: 96, textAlign: "center" }}>
        <p style={{ color: "#dc2626", marginBottom: 16 }}>{error}</p>
        <button className="cta-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="products-page" style={{ paddingTop: 96 }}>
      <div className="products-header">
        <h1 className="products-title">Customize Tshirts</h1>
        <p className="products-sub">
          {filtered.length} style{filtered.length !== 1 ? "s" : ""} shown — Customize & order signature streetwear
        </p>
      </div>

      {/* UNDER CONSTRUCTION — EXPLORE NEW KIDS LAUNCHES BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, #fef08a 0%, #fed7aa 100%)",
          border: "1.5px solid #f59e0b",
          borderRadius: 14,
          padding: "14px 20px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 4px 14px rgba(245, 158, 11, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, flexShrink: 0, color: "#b45309" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 22h20L12 2z" />
              <path d="M12 9v5" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  background: "#d97706",
                  color: "#ffffff",
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                🚧 UNDER CONSTRUCTION
              </span>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#78350f" }}>
                Explore New Kids Launches
              </span>
            </div>
            <p style={{ margin: "3px 0 0 0", fontSize: 13, color: "#92400e", fontWeight: 500 }}>
              New interactive kids customizer & exclusive drop features are currently under construction!
            </p>
          </div>
        </div>

        <Link
          href="/kids"
          style={{
            padding: "8px 16px",
            borderRadius: 99,
            background: "#78350f",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            whiteSpace: "nowrap",
          }}
        >
          🎈 Go to Kids Portal →
        </Link>
      </div>

      {/* Category Filters: Men, Women, Unisex */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
        <span style={{ fontSize: 13, fontWeight: 700, alignSelf: "center", marginRight: 4, color: "var(--text2)" }}>Category:</span>
        {categories.map((c) => (
          <button
            key={c}
            className={`fit-chip ${categoryFilter === c ? "active" : ""}`}
            onClick={() => setCategoryFilter(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filtered.map((p) => {
          const onSale = isSaleOn && p.price < p.basePrice;
          const sizeStockMap = getSizeStock(p);
          const availableSizes = p.sizes || ["S", "M", "L", "XL"];
          const isAllOutOfStock = p.qty === 0 || availableSizes.every((sz) => (sizeStockMap[sz] ?? 0) <= 0);
          const currentSize = selectedSizes[p.id] || availableSizes.find((sz) => (sizeStockMap[sz] ?? 0) > 0) || availableSizes[0];

          return (
            <div
              className={`product-card ${isAllOutOfStock ? "oos" : ""}`}
              key={p.id}
            >
              <div className="product-img-wrap" style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={p.image}
                  alt={p.name}
                  className="product-img"
                  loading="lazy"
                  style={{
                    filter: isAllOutOfStock ? "blur(3.5px) grayscale(70%) opacity(0.7)" : "none",
                    transition: "filter 0.3s",
                  }}
                />

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
                  <span className="sale-tag" style={{ position: "absolute", top: 12, left: 12 }}>
                    {sale.discount}% OFF
                  </span>
                ) : null}

                <button
                  className="icon-btn"
                  style={{
                    position: "absolute", top: 12, right: 12,
                    background: "rgba(255,255,255,0.88)", backdropFilter: "blur(4px)",
                    border: "none", color: wishlist.includes(p.id) ? "#c84b2f" : "#888",
                  }}
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(p); }}
                >
                  <Icon.Heart filled={wishlist.includes(p.id)} />
                </button>
              </div>

              <div className="product-info" style={{ padding: "14px 16px" }}>
                <div>
                  <div className="product-name">{p.name}</div>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
                    {availableSizes.map((sz) => {
                      const count = sizeStockMap[sz] ?? 0;
                      const isSizeOOS = isAllOutOfStock || count <= 0;

                      return (
                        <button
                          key={sz}
                          type="button"
                          disabled={isSizeOOS}
                          onClick={() => setSelectedSizes((prev) => ({ ...prev, [p.id]: sz }))}
                          style={{
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: currentSize === sz && !isSizeOOS ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                            background: isSizeOOS ? "var(--bg2)" : currentSize === sz ? "var(--accent)" : "var(--bg)",
                            color: isSizeOOS ? "var(--text2)" : currentSize === sz ? "#ffffff" : "var(--text)",
                            fontSize: 11,
                            fontWeight: 500,
                            textDecoration: isSizeOOS ? "line-through" : "none",
                            opacity: isSizeOOS ? 0.45 : 1,
                            cursor: isSizeOOS ? "not-allowed" : "pointer",
                          }}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="price-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className="product-price">₹{p.price}</span>
                    {onSale && <span className="product-price-orig">₹{p.basePrice}</span>}
                  </div>

                  <button
                    type="button"
                    disabled={isAllOutOfStock}
                    onClick={() => addToCart({ ...p, price: p.price, name: `${p.name} (${currentSize})` })}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: isAllOutOfStock ? "var(--border)" : "var(--text)",
                      color: isAllOutOfStock ? "var(--text2)" : "var(--bg)",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: isAllOutOfStock ? "not-allowed" : "pointer",
                    }}
                  >
                    {isAllOutOfStock ? "Out of Stock" : "+ Add"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
