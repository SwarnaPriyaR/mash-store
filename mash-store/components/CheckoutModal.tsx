"use client";

/**
 * components/CheckoutModal.tsx
 * Migrated from the CheckoutModal function in App.jsx.
 * Full checkout flow: card / UPI / net banking / WhatsApp.
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
  const [method, setMethod] = useState("card");
  const [step, setStep] = useState<"form" | "processing" | "success">("form");
  const [orderId] = useState(() => "MASH" + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardNum, setCardNum] = useState(""); const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState(""); const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState(""); const [upiApp, setUpiApp] = useState("");
  const [bank, setBank] = useState("");

  const shipping = grandTotal >= 999 ? 0 : 79;
  const finalTotal = grandTotal + shipping;

  const formatCard = (v: string) => v.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g, "").substring(0, 4); return d.length >= 3 ? d.substring(0, 2) + "/" + d.substring(2) : d; };

  const waMessage = () => {
    const lines = cart.map(({ product, qty }) => `• ${product.name} (${product.fit}) × ${qty} = ₹${product.price * qty}`);
    return `Hello MASH! 👋\nI'd like to place an order:\n\n${lines.join("\n")}\n\nShipping: ${shipping === 0 ? "FREE" : "₹" + shipping}\n*Total: ₹${finalTotal}*\n\nPlease confirm availability. Thank you! 🛍️`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (method === "card") {
      if (cardNum.replace(/\s/g, "").length < 16) e.cardNum = "Enter a valid 16-digit card number";
      if (!cardName.trim()) e.cardName = "Name is required";
      if (expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)";
      if (cvv.length < 3) e.cvv = "Enter valid CVV";
    }
    if (method === "upi" && !upiId.includes("@")) e.upiId = "Enter a valid UPI ID (e.g. name@upi)";
    if (method === "netbanking" && !bank) e.bank = "Please select a bank";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePay = () => {
    if (!validate()) return;
    setStep("processing");
    setTimeout(() => setStep("success"), 2800);
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(waMessage());
    window.open(`https://wa.me/918825506681?text=${msg}`, "_blank");
    onSuccess(cart);
  };

  const BANKS = [
    { id: "sbi", name: "SBI", icon: "🏦" }, { id: "hdfc", name: "HDFC", icon: "🏛️" },
    { id: "icici", name: "ICICI", icon: "🏧" }, { id: "axis", name: "Axis", icon: "💳" },
    { id: "kotak", name: "Kotak", icon: "🏪" }, { id: "other", name: "Others", icon: "🔗" },
  ];
  const UPI_APPS = ["GPay", "PhonePe", "Paytm", "BHIM", "Amazon Pay"];

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && step !== "processing" && onClose()}>
      <div className="checkout-modal">
        {step !== "success" && (
          <div className="co-header">
            <span className="co-title">{step === "processing" ? "PROCESSING..." : "CHECKOUT"}</span>
            {step !== "processing" && <button className="modal-close" onClick={onClose}>×</button>}
          </div>
        )}
        {step === "processing" && (
          <div className="processing-wrap">
            <div className="spinner" />
            <div className="processing-title">SECURING YOUR PAYMENT</div>
            <div className="processing-sub">Please don&apos;t close this window…</div>
          </div>
        )}
        {step === "success" && (
          <div className="success-wrap">
            <div className="success-icon">✓</div>
            <div className="success-title">ORDER CONFIRMED!</div>
            <p className="success-sub">Your payment of <strong>₹{finalTotal}</strong> was successful. Your tees are on their way!</p>
            <div className="order-id">Order ID: <span>{orderId}</span></div>
            <button className="success-cta" onClick={() => onSuccess(cart)}>BACK TO HOME</button>
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
            <div className="pay-tabs">
              {[["card", "💳", "Card"], ["upi", "📱", "UPI"], ["netbanking", "🏦", "Net Banking"], ["whatsapp", "💬", "WhatsApp"]].map(([id, icon, label]) => (
                <button key={id} className={`pay-tab ${method === id ? "active" : ""}`} onClick={() => { setMethod(id); setErrors({}); }}>
                  <span className="pay-tab-icon">{icon}</span>{label}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div>
                <div className="card-visual">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="card-chip"><div className="card-chip-lines"><div className="card-chip-line" /><div className="card-chip-line" /><div className="card-chip-line" /></div></div>
                    <div className="card-brand">MASH PAY</div>
                  </div>
                  <div className="card-number-display">{cardNum || "•••• •••• •••• ••••"}</div>
                  <div className="card-bottom">
                    <div><div className="card-label">Card Holder</div><div className="card-value">{cardName || "CARD HOLDER"}</div></div>
                    <div><div className="card-label">Expires</div><div className="card-value">{expiry || "MM/YY"}</div></div>
                  </div>
                </div>
                <div className="card-grid">
                  <div className="form-field full"><label className="form-label">Card Number</label><input className="form-input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={(e) => setCardNum(formatCard(e.target.value))} maxLength={19} />{errors.cardNum && <div className="field-error">{errors.cardNum}</div>}</div>
                  <div className="form-field full"><label className="form-label">Name on Card</label><input className="form-input" placeholder="As on card" value={cardName} onChange={(e) => setCardName(e.target.value.toUpperCase())} />{errors.cardName && <div className="field-error">{errors.cardName}</div>}</div>
                  <div className="form-field"><label className="form-label">Expiry</label><input className="form-input" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} maxLength={5} />{errors.expiry && <div className="field-error">{errors.expiry}</div>}</div>
                  <div className="form-field"><label className="form-label">CVV</label><input className="form-input" placeholder="•••" type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").substring(0, 4))} maxLength={4} />{errors.cvv && <div className="field-error">{errors.cvv}</div>}</div>
                </div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "upi" && (
              <div>
                <label className="form-label" style={{ display: "block", marginBottom: 8 }}>Select App (optional)</label>
                <div className="upi-logos">{UPI_APPS.map((a) => <button key={a} className={`upi-logo-chip ${upiApp === a ? "sel" : ""}`} onClick={() => setUpiApp(upiApp === a ? "" : a)}>{a}</button>)}</div>
                <div className="form-field"><label className="form-label">UPI ID</label><input className="form-input" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} />{errors.upiId && <div className="field-error">{errors.upiId}</div>}</div>
                <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--text2)" }}>💡 You&apos;ll receive a payment request on your UPI app. Approve it within 5 minutes.</div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "netbanking" && (
              <div>
                <label className="form-label" style={{ display: "block", marginBottom: 12 }}>Select Your Bank</label>
                <div className="bank-grid">{BANKS.map((b) => <button key={b.id} className={`bank-chip ${bank === b.id ? "sel" : ""}`} onClick={() => setBank(b.id)}><div className="bank-icon">{b.icon}</div>{b.name}</button>)}</div>
                {errors.bank && <div className="field-error">{errors.bank}</div>}
                <div style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 13, color: "var(--text2)" }}>🔒 You&apos;ll be redirected to your bank&apos;s secure portal.</div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "whatsapp" && (
              <div>
                <div className="whatsapp-tab-body">
                  <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 10, lineHeight: 1.6 }}>
                    Clicking below will open WhatsApp with your complete order details pre-filled. Send it to confirm your order with MASH.
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 6, fontWeight: 600 }}>Preview of your message:</div>
                  <div className="wa-preview">{waMessage()}</div>
                  <div style={{ marginTop: 12, fontSize: 12, color: "var(--text2)" }}>📞 Order will be sent to: <strong>+91 88255 06681</strong></div>
                </div>
                <button className="wa-send-btn" onClick={handleWhatsApp}>📲 SEND ORDER ON WHATSAPP</button>
              </div>
            )}

            {method !== "whatsapp" && <div className="secure-badge">🔒 256-bit SSL encrypted · Secured by MASH Pay</div>}
          </div>
        )}
      </div>
    </div>
  );
}
