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
}

export function ProductDetailClient({ product }: Props) {
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
      <Link href="/products" className="detail-back" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text2)", textDecoration: "none" }}>
        <Icon.ArrowLeft /> Back to Products
      </Link>
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
      {product.reviews.length > 0 && (
        <div className="reviews-section">
          <h2 className="reviews-title">CUSTOMER REVIEWS</h2>
          {product.reviews.map((r, i) => (
            <div className="review-card" key={i}>
              <div className="review-header">
                <span className="review-user">{r.user}</span>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon.Star key={s} filled={s <= r.rating} />
                  ))}
                </div>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
