"use client";

import { useCart } from "@/components/CartProvider";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, products: allProducts, addToCart, toggleWishlist } = useCart();
  const [activeTab, setActiveTab] = useState<"all" | "adult" | "kids">("all");

  const items = allProducts.filter((p) => wishlist.includes(p.id));

  const filteredItems = items.filter((p) => {
    if (activeTab === "kids") return Boolean(p.isKids);
    if (activeTab === "adult") return !p.isKids;
    return true;
  });

  const moveToCart = (product: typeof items[number]) => {
    toggleWishlist(product);
    addToCart(product);
  };

  if (items.length === 0) {
    return (
      <div className="wishlist-page" style={{ paddingTop: 96 }}>
        <h1 className="cart-title">WISHLIST</h1>
        <div className="empty-state">
          <div className="empty-icon"><Icon.Heart filled={false} /></div>
          <div className="empty-title">No items saved</div>
          <p className="empty-sub">Heart products you love to save them here.</p>
          <Link href="/products" className="empty-cta" style={{ textDecoration: "none", display: "inline-block" }}>
            Explore Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page" style={{ paddingTop: 96 }}>
      <h1 className="cart-title">WISHLIST</h1>

      {/* FILTER TABS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          style={{
            padding: "8px 16px",
            borderRadius: 99,
            border: activeTab === "all" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
            background: activeTab === "all" ? "var(--accent)" : "var(--bg2)",
            color: activeTab === "all" ? "#ffffff" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Saved ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("adult")}
          style={{
            padding: "8px 16px",
            borderRadius: 99,
            border: activeTab === "adult" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
            background: activeTab === "adult" ? "var(--accent)" : "var(--bg2)",
            color: activeTab === "adult" ? "#ffffff" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Adult Items ({items.filter((p) => !p.isKids).length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kids")}
          style={{
            padding: "8px 16px",
            borderRadius: 99,
            border: activeTab === "kids" ? "1.5px solid var(--accent)" : "1px solid var(--border)",
            background: activeTab === "kids" ? "var(--accent)" : "var(--bg2)",
            color: activeTab === "kids" ? "#ffffff" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🎈 Kids Items ({items.filter((p) => p.isKids).length})
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text2)" }}>
          No items found in this tab.
        </div>
      ) : (
        <div className="wishlist-grid">
          {filteredItems.map((p) => (
            <div className="wishlist-card" key={p.id}>
              <img src={p.image} alt={p.name} className="wishlist-img" />
              <div className="wishlist-info">
                <div className="wishlist-name">{p.name}</div>
                <div className="wishlist-price">₹{p.price}</div>
                <div className="wishlist-actions">
                  <button className="wl-move-btn" onClick={() => moveToCart(p)}>
                    Move to Cart
                  </button>
                  <button className="wl-remove-btn" onClick={() => toggleWishlist(p)}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
