"use client";

import { useCart } from "@/components/CartProvider";
import { Icon } from "@/components/Icon";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlist, products: allProducts, addToCart, toggleWishlist } = useCart();
  const items = allProducts.filter((p) => wishlist.includes(p.id));

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
      <p className="cart-sub" style={{ marginBottom: 28 }}>
        {items.length} saved item{items.length !== 1 ? "s" : ""}
      </p>
      <div className="wishlist-grid">
        {items.map((p) => (
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
    </div>
  );
}
