"use client";

import { useCart } from "@/components/CartProvider";
import { Icon } from "@/components/Icon";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useState } from "react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, changeQty } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const grandTotal = cart.reduce((s, x) => s + x.product.price * x.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-page" style={{ paddingTop: 96 }}>
        <h1 className="cart-title">YOUR CART</h1>
        <div className="empty-state">
          <div className="empty-icon"><Icon.Cart /></div>
          <div className="empty-title">Your cart is empty</div>
          <p className="empty-sub">Add some bold tees to get started.</p>
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
      <p className="cart-sub">{cart.length} item{cart.length !== 1 ? "s" : ""}</p>
      <div className="cart-table">
        <div className="cart-head">
          <span className="cart-head-label">Item</span>
          <span className="cart-head-label">Product</span>
          <span className="cart-head-label">Qty</span>
          <span className="cart-head-label">Subtotal</span>
          <span></span>
        </div>
        {cart.map(({ product, qty }) => (
          <div className="cart-row" key={product.id}>
            <img src={product.image} alt={product.name} className="cart-row-img" />
            <div>
              <div className="cart-row-name">{product.name}</div>
              <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>₹{product.price} each</div>
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
          <span className="total-label">Grand Total</span>
          <span className="total-amt">₹{grandTotal}</span>
          <button className="checkout-btn" onClick={() => setShowCheckout(true)}>CHECKOUT</button>
        </div>
      </div>
      {showCheckout && (
        <CheckoutModal
          cart={cart}
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
