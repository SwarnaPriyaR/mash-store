"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";
import { useCart } from "@/components/CartProvider";
import { useSale } from "@/components/SaleProvider";
import type { Product } from "@/lib/db";

interface ProductWithReviews extends Product {
  reviews: { user: string; rating: number; text: string }[];
}

interface Props {
  product: ProductWithReviews;
  relatedProducts?: Product[];
}

export function ProductDetailClient({ product, relatedProducts = [] }: Props) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { sale } = useSale();

  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const salePrice = isSaleOn ? Math.round(product.basePrice * (1 - sale.discount / 100)) : null;
  const displayPrice = salePrice ?? product.basePrice;
  const onSale = salePrice !== null && salePrice < product.basePrice;
  const isWishlisted = wishlist.includes(product.id);
  const stockStatus = product.qty === 0 ? "out" : product.qty <= 5 ? "low" : "ok";

  return (
    <div className="detail-page" style={{ paddingTop: 96 }}>
      <Link href="/products" className="detail-back" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text2)", textDecoration: "none", marginBottom: 16 }}>
        <Icon.ArrowLeft /> Back to Products
      </Link>

      {/* UNDER CONSTRUCTION BANNER */}
      <div
        style={{
          background: "#fef08a",
          border: "1.5px solid #eab308",
          borderRadius: 12,
          padding: "12px 18px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#713f12",
        }}
      >
        <div style={{ width: 28, height: 28, flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 22h20L12 2z" />
            <path d="M12 9v5" />
            <path d="M12 17h.01" />
          </svg>
        </div>
        <div>
          <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", background: "#eab308", color: "#ffffff", padding: "2px 8px", borderRadius: 4, marginRight: 8 }}>
            🚧 UNDER CONSTRUCTION
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            Enhanced 3D view & custom fit preview are currently under construction. Basic product ordering remains fully functional below!
          </span>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-img-wrap">
          <img src={product.image} alt={product.name} className="detail-img" />
          {onSale && (
            <div style={{ position: "absolute", top: 16, left: 16 }}>
              <span className="sale-tag" style={{ fontSize: 13, padding: "5px 12px" }}>SALE</span>
            </div>
          )}
        </div>
        <div className="detail-info">
          <div className="detail-tags">
            {product.tags.map((t) => (
              <span key={t} className="product-tag">{t}</span>
            ))}
            <span className="product-tag" style={{ background: "#4b5563" }}>{product.fit}</span>
            {product.category && <span className="product-tag" style={{ background: "#ec4899", color: "#fff" }}>{product.category}</span>}
          </div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price-row">
            <span style={{ color: "var(--text2)", fontSize: 16 }}>₹</span>
            <span className="detail-price">{displayPrice}</span>
            {onSale && <span className="detail-price-orig">₹{product.basePrice}</span>}
          </div>
          <div className={`stock-info ${stockStatus === "ok" ? "stock-ok" : stockStatus === "low" ? "stock-low" : "stock-out"}`}>
            {stockStatus === "ok" && `✓ In Stock (${product.qty} available)`}
            {stockStatus === "low" && `⚠ Only ${product.qty} left — order soon!`}
            {stockStatus === "out" && "✗ Out of Stock"}
          </div>
          <hr className="divider" />
          <p className="detail-desc">{product.description}</p>
          <div className="detail-actions">
            <button
              className="btn-primary"
              disabled={product.qty === 0}
              onClick={() => addToCart({ ...product, price: displayPrice })}
            >
              {product.qty === 0 ? "Out of Stock" : "+ Add to Cart"}
            </button>
            <button
              className={`btn-secondary ${isWishlisted ? "wishlisted" : ""}`}
              onClick={() => toggleWishlist(product)}
            >
              {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>

      {/* HORIZONTAL COLOR / STYLE VARIATIONS ROW */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: 48, borderTop: "1px solid var(--border)", paddingTop: 32 }}>
          <h3 style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 28, letterSpacing: "0.04em", marginBottom: 16 }}>
            MORE STYLES & COLOR VARIATIONS
          </h3>
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 16,
              scrollbarWidth: "thin",
            }}
          >
            {relatedProducts.map((rel) => {
              const relPrice = isSaleOn ? Math.round(rel.basePrice * (1 - sale.discount / 100)) : rel.basePrice;
              return (
                <Link
                  key={rel.id}
                  href={`/product/${rel.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    flex: "0 0 160px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <img
                    src={rel.image}
                    alt={rel.name}
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }}
                  />
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {rel.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text2)", margin: "2px 0 6px" }}>{rel.fit}</div>
                    <div style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 18, color: "var(--accent)" }}>
                      ₹{relPrice}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
