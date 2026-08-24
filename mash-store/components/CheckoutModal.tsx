"use client";

/**
 * components/CheckoutModal.tsx
 * Checkout flow with WhatsApp Checkout first, and Under Construction banners for other payment options.
 */

import { useState } from "react";
import type { CartItem } from "./CartProvider";

interface Props {
  cart: CartItem[];
  grandTotal: number;
  onClose: () => void;
  onSuccess: (cart: CartItem[]) => void;
}

export function CheckoutModal({ cart, grandTotal, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState("whatsapp"); // WhatsApp is 1st option by default
  const [step, setStep] = useState<"form" | "processing" | "success">("form");

  const shipping = grandTotal >= 999 ? 0 : 79;
  const finalTotal = grandTotal + shipping;

  const waMessage = () => {
    const lines = cart.map(({ product, qty }) => `• ${product.name} × ${qty} = ₹${product.price * qty}`);
    return `Hello MASH! 👋\nI'd like to place an order:\n\n${lines.join("\n")}\n\nShipping: ${shipping === 0 ? "FREE" : "₹" + shipping}\n*Total: ₹${finalTotal}*\n\nPlease confirm availability. Thank you! 🛍️`;
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(waMessage());
    window.open(`https://wa.me/918825506681?text=${msg}`, "_blank");
    onSuccess(cart);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && step !== "processing" && onClose()}>
      <div className="checkout-modal" style={{ maxWidth: 520 }}>
        {step !== "success" && (
          <div className="co-header">
            <span className="co-title">{step === "processing" ? "PROCESSING..." : "CHECKOUT"}</span>
            {step !== "processing" && <button className="modal-close" onClick={onClose}>×</button>}
          </div>
        )}

        {step === "form" && (
          <div className="co-body">
            <div className="co-summary">
              {cart.map(({ product, qty }) => (
                <div className="co-summary-row" key={product.id}>
                  <span>{product.name} × {qty}</span><span>₹{product.price * qty}</span>
                </div>
              ))}
              <div className="co-summary-row"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              <div className="co-summary-row total"><span>Total Payable</span><span>₹{finalTotal}</span></div>
            </div>

            {/* PAYMENT METHOD TABS (WhatsApp is 1st) */}
            <div className="pay-tabs" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {[
                ["whatsapp", "💬", "WhatsApp"],
                ["card", "💳", "Card"],
                ["upi", "📱", "UPI"],
                ["netbanking", "🏦", "Net Banking"],
              ].map(([id, icon, label]) => (
                <button
                  key={id}
                  className={`pay-tab ${method === id ? "active" : ""}`}
                  onClick={() => setMethod(id)}
                  style={{ position: "relative" }}
                >
                  <span className="pay-tab-icon">{icon}</span>
                  {label}
                  {id !== "whatsapp" && (
                    <span
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -4,
                        background: "#ef4444",
                        color: "#fff",
                        fontSize: 9,
                        fontWeight: 800,
                        padding: "2px 5px",
                        borderRadius: 99,
                      }}
                    >
                      🚧
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* WHATSAPP CHECKOUT (1st Option) */}
            {method === "whatsapp" && (
              <div>
                <div className="whatsapp-tab-body">
                  <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
                    Clicking below will open WhatsApp with your complete order details pre-filled. Send it to confirm your order directly with MASH!
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, fontWeight: 600 }}>Preview of your order message:</div>
                  <div className="wa-preview">{waMessage()}</div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)" }}>📞 Direct Support: <strong>+91 88255 06681</strong></div>
                </div>
                <button className="wa-send-btn" onClick={handleWhatsApp} style={{ width: "100%", marginTop: 14 }}>
                  📲 SEND ORDER ON WHATSAPP
                </button>
              </div>
            )}

            {/* UNDER CONSTRUCTION OVERLAY FOR CARD / UPI / NETBANKING */}
            {method !== "whatsapp" && (
              <div
                style={{
                  background: "var(--bg2)",
                  border: "1.5px dashed var(--border)",
                  borderRadius: 16,
                  padding: "36px 20px",
                  textAlign: "center",
                  margin: "12px 0",
                }}
              >
                <div style={{ width: 54, height: 54, margin: "0 auto 12px", color: "var(--accent)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M12 2L2 22h20L12 2z" />
                    <path d="M12 9v5" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>

                <div
                  style={{
                    display: "inline-block",
                    background: "#fef08a",
                    border: "1px solid #eab308",
                    color: "#854d0e",
                    fontWeight: 800,
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: 99,
                    marginBottom: 10,
                  }}
                >
                  🚧 UNDER CONSTRUCTION
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, margin: "6px 0", color: "var(--text)" }}>
                  {method === "card" ? "Card Checkout" : method === "upi" ? "UPI Payments" : "Net Banking"} Under Construction
                </h3>

                <p style={{ fontSize: 13, color: "var(--text2)", maxWidth: 340, margin: "4px auto 16px" }}>
                  Direct online payments are currently undergoing maintenance. Please use <strong>WhatsApp Checkout</strong> above to place your order instantly!
                </p>

                <button
                  type="button"
                  onClick={() => setMethod("whatsapp")}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 99,
                    border: "none",
                    background: "var(--text)",
                    color: "var(--bg)",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  💬 Switch to WhatsApp Checkout ↗
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
