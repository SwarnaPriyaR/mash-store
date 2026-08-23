"use client";
// app/products/page.tsx — Products Page
// Data is fetched via Server Component wrapper, product card interactions are client-side.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import { convertDriveUrl } from "@/lib/helpers";
import type { Product } from "@/lib/db";

// Products listing fetched from Route Handler so we can keep this fully client-rendered
// for wishlist/sale interactions, which need client state.
export default function ProductsPage() {
  const { wishlist, toggleWishlist } = useCart();
  const { sale } = useSale();
  const [products, setProducts] = useState<(Product & { price: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [fitFilter, setFitFilter] = useState("All");

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

  // Apply sale prices whenever sale changes
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

  const categories = ["All", "Men T-Shirt", "Women T-Shirt", "Kids Dress"];
  const fits = ["All", "Regular", "Oversized"];

  const filtered = products.filter((p) => {
    const matchCategory =
      categoryFilter === "All" ||
      p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
      p.tags?.some((t) => t.toLowerCase() === categoryFilter.toLowerCase());
    const matchFit = fitFilter === "All" || p.fit === fitFilter;
    return matchCategory && matchFit;
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
        <h1 className="products-title">ALL DROPS</h1>
        <p className="products-sub">
          {filtered.length} style{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Category & Fit Filters */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        <div className="fit-filter" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, alignSelf: "center", marginRight: 8, color: "var(--text2)" }}>Category:</span>
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

        <div className="fit-filter" style={{ marginBottom: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, alignSelf: "center", marginRight: 8, color: "var(--text2)" }}>Fit:</span>
          {fits.map((f) => (
            <button
              key={f}
              className={`fit-chip ${fitFilter === f ? "active" : ""}`}
              onClick={() => setFitFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="product-grid">
        {filtered.map((p) => {
          const onSale = isSaleOn && p.price < p.basePrice;
          return (
            <div
              className={`product-card ${p.qty === 0 ? "oos" : ""}`}
              key={p.id}
            >
              <div className="product-img-wrap">
                <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                <div className="product-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="product-tag">{t}</span>
                  ))}
                  {onSale && <span className="sale-tag">{sale.discount}% OFF</span>}
                  {p.qty === 0 && <span className="oos-tag">Out of Stock</span>}
                </div>
                {p.qty > 0 && (
                  <div className="qty-tag">
                    {p.qty <= 5 ? `Only ${p.qty} left!` : `${p.qty} in stock`}
                  </div>
                )}
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
              <Link
                href={p.qty > 0 ? `/product/${p.id}` : "#"}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="product-info">
                  <div>
                    <div className="product-name">{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{p.fit}</div>
                  </div>
                  <div className="price-row">
                    <span className="product-price">
                      <span className="product-price-prefix">₹</span>{p.price}
                    </span>
                    {onSale && <span className="product-price-orig">₹{p.basePrice}</span>}
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
