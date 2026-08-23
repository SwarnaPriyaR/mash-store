"use client";

import { useCart } from "@/components/CartProvider";
import { Icon } from "@/components/Icon";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, changeQty } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "adult" | "kids">("all");

  const filteredCart = cart.filter((x) => {
    if (activeTab === "kids") return Boolean(x.product.isKids);
    if (activeTab === "adult") return !x.product.isKids;
    return true;
  });

  const grandTotal = filteredCart.reduce((s, x) => s + x.product.price * x.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-page" style={{ paddingTop: 96 }}>
        <h1 className="cart-title">YOUR CART</h1>
        <div className="empty-state">
          <div className="empty-icon"><Icon.Cart /></div>
          <div className="empty-title">Your cart is empty</div>
          <p className="empty-sub">Add some bold products to get started.</p>
          <Link href="/products" className="empty-cta" style={{ textDecoration: "none", display: "inline-block" }}>
            Shop Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" style={{ paddingTop: 96 }}>
      <h1 className="cart-title">YOUR CART</h1>

      {/* FILTER TABS: All, Adult, Kids */}
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
          All Items ({cart.length})
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
          Adult Items ({cart.filter((c) => !c.product.isKids).length})
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
          🎈 Kids Items ({cart.filter((c) => c.product.isKids).length})
        </button>
      </div>

      {filteredCart.length === 0 ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text2)" }}>
          No items found in this tab.
        </div>
      ) : (
        <>
          <div className="cart-table">
            <div className="cart-head">
              <span className="cart-head-label">Item</span>
              <span className="cart-head-label">Product</span>
              <span className="cart-head-label">Qty</span>
              <span className="cart-head-label">Subtotal</span>
              <span></span>
            </div>
            {filteredCart.map(({ product, qty }) => (
              <div className="cart-row" key={product.id}>
                <img src={product.image} alt={product.name} className="cart-row-img" />
                <div>
                  <div className="cart-row-name">{product.name}</div>
                  <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                    ₹{product.price} each {product.isKids && <span style={{ color: "var(--accent)", fontWeight: 700 }}> (Kids)</span>}
                  </div>
                </div>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => changeQty(product.id, -1)}>−</button>
                  <span className="qty-num">{qty}</span>
                  <button className="qty-btn" onClick={() => changeQty(product.id, 1)}>+</button>
                </div>
                <div className="cart-row-price">₹{product.price * qty}</div>
                <button className="cart-remove-btn" onClick={() => removeFromCart(product.id)}>
                  <Icon.Trash />
                </button>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="total-row">
              <span className="total-label">Subtotal</span>
              <span className="total-amt">₹{grandTotal}</span>
              <button className="checkout-btn" onClick={() => setShowCheckout(true)}>CHECKOUT</button>
            </div>
          </div>
        </>
      )}

      {showCheckout && (
        <CheckoutModal
          cart={filteredCart}
          grandTotal={grandTotal}
          onClose={() => setShowCheckout(false)}
          onSuccess={(snapshot) => {
            snapshot.forEach((item) => removeFromCart(item.product.id));
            setShowCheckout(false);
          }}
        />
      )}
    </div>
  );
}
