"use client";

/**
 * app/orders/OrdersClient.tsx
 * Customer Order Details & History page linked with email ID.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import type { OrderData } from "@/lib/db";

export function OrdersClient() {
  const [emailInput, setEmailInput] = useState("");
  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const fetchOrders = useCallback(async (email: string) => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/customer?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
      setActiveEmail(email.trim());
      localStorage.setItem("mash_customer_email", email.trim());
      setSearched(true);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem("mash_customer_email");
    if (savedEmail) {
      setEmailInput(savedEmail);
      fetchOrders(savedEmail);
    }
  }, [fetchOrders]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      fetchOrders(emailInput);
    }
  };

  const handleClearEmail = () => {
    setEmailInput("");
    setActiveEmail(null);
    setOrders([]);
    setSearched(false);
    localStorage.removeItem("mash_customer_email");
  };

  const getStatusStep = (status: string = "Order Received"): number => {
    const s = status.toLowerCase();
    if (s.includes("received") && !s.includes("customer")) return 1;
    if (s.includes("progress")) return 2;
    if (s.includes("transient") || s.includes("transit") || s.includes("shipped")) return 3;
    if (s.includes("customer received") || s.includes("delivered")) return 4;
    if (s.includes("return")) return -1;
    return 1;
  };

  return (
    <div className="products-page" style={{ paddingBottom: 64, maxWidth: 1100, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
      {/* PAGE HEADER */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span className="sale-tag" style={{ fontSize: 12, letterSpacing: "0.08em", padding: "4px 12px", marginBottom: 12, display: "inline-block" }}>
          📦 CUSTOMER PORTAL
        </span>
        <h1 className="products-title" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "8px 0" }}>
          MY ORDERS & DETAILS
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 540, margin: "0 auto" }}>
          Enter your registered email ID to view all your order history, delivery status, and item details.
        </p>
      </div>

      {/* EMAIL SEARCH BAR FORM */}
      <div
        style={{
          background: "var(--surface)",
          border: "1.5px solid var(--border)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 40,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: "1 1 300px", position: "relative" }}>
            <label style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", display: "block", marginBottom: 6 }}>
              📧 Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. customer@example.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--text)",
                fontSize: 14,
                fontWeight: 600,
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginTop: 22, display: "flex", gap: 10 }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ padding: "12px 24px", fontSize: 14, cursor: loading ? "wait" : "pointer" }}
            >
              {loading ? "Searching..." : "🔍 Find My Orders"}
            </button>

            {activeEmail && (
              <button
                type="button"
                onClick={handleClearEmail}
                className="btn-secondary"
                style={{ padding: "12px 16px", fontSize: 14 }}
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {activeEmail && (
          <div style={{ marginTop: 14, fontSize: 13, color: "var(--accent)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span>✓ Showing orders linked with <b>{activeEmail}</b></span>
          </div>
        )}
      </div>

      {/* ORDERS LIST CONTAINER */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text2)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Fetching your order details...</div>
        </div>
      ) : searched && orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No Orders Found</h3>
          <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 420, margin: "0 auto 20px" }}>
            We couldn't find any orders linked with <b>{activeEmail}</b>. Please check if you entered the correct email address used during checkout.
          </p>
          <Link href="/products" className="btn-primary" style={{ textDecoration: "none", display: "inline-block", padding: "10px 20px", fontSize: 14 }}>
            Browse Streetwear Drops
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {orders.map((ord) => {
            const items = ord.items || [];
            const step = getStatusStep(ord.orderStatus);
            const isReturn = ord.orderStatus?.toLowerCase().includes("return");

            return (
              <div
                key={ord.id}
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                {/* ORDER MASTER HEADER */}
                <div
                  style={{
                    padding: "16px 24px",
                    background: "var(--bg2)",
                    borderBottom: "1.5px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 17, color: "var(--accent)", letterSpacing: "0.02em" }}>
                      📦 Order {ord.id}
                    </span>
                    <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                      📅 {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    {/* PAYMENT STATUS BADGE */}
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        background: ord.status === "Paid" ? "#dcfce7" : "#fee2e2",
                        color: ord.status === "Paid" ? "#15803d" : "#991b1b",
                        border: ord.status === "Paid" ? "1px solid #16a34a" : "1px solid #ef4444",
                      }}
                    >
                      Payment: {ord.status}
                    </span>

                    {/* DELIVERY STATUS BADGE */}
                    <span
                      style={{
                        padding: "5px 12px",
                        borderRadius: 99,
                        fontSize: 12,
                        fontWeight: 700,
                        background: isReturn ? "#fef3c7" : "var(--bg)",
                        color: isReturn ? "#b45309" : "var(--text)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      Status: {ord.orderStatus || "Order Received"}
                    </span>
                  </div>
                </div>

                {/* DELIVERY STATUS PROGRESS TRACKER */}
                <div style={{ padding: "20px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", marginBottom: 14 }}>
                    🚚 Delivery Progress Tracker
                  </div>

                  {isReturn ? (
                    <div style={{ background: "#fef3c7", color: "#92400e", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      🔄 Order is currently under Return / Refund processing.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, position: "relative" }}>
                      {[
                        { title: "Order Received", stepNum: 1, icon: "📝" },
                        { title: "In Progress", stepNum: 2, icon: "⚙️" },
                        { title: "In Transit", stepNum: 3, icon: "🚚" },
                        { title: "Delivered", stepNum: 4, icon: "🎉" },
                      ].map((st) => {
                        const isDone = step >= st.stepNum;
                        const isCurrent = step === st.stepNum;

                        return (
                          <div
                            key={st.stepNum}
                            style={{
                              textAlign: "center",
                              padding: "10px 6px",
                              borderRadius: 8,
                              background: isDone ? (isCurrent ? "rgba(200,75,47,0.1)" : "var(--bg2)") : "transparent",
                              border: isCurrent ? "1.5px solid var(--accent)" : "1px solid transparent",
                              opacity: isDone ? 1 : 0.45,
                              transition: "all 0.2s",
                            }}
                          >
                            <div style={{ fontSize: 18, marginBottom: 4 }}>{st.icon}</div>
                            <div style={{ fontSize: 12, fontWeight: isDone ? 700 : 500, color: isCurrent ? "var(--accent)" : "var(--text)" }}>
                              {st.title}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ORDER ITEMS SUB-TABLE */}
                <div style={{ padding: "18px 24px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", marginBottom: 12 }}>
                    🛒 Order Line Items ({items.length} items)
                  </div>

                  {items.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic" }}>
                      No items recorded in this order.
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                            <th style={{ padding: "10px 14px", fontWeight: 700 }}>Item ID</th>
                            <th style={{ padding: "10px 14px", fontWeight: 700 }}>Product Name</th>
                            <th style={{ padding: "10px 14px", fontWeight: 700 }}>Size</th>
                            <th style={{ padding: "10px 14px", fontWeight: 700 }}>Qty</th>
                            <th style={{ padding: "10px 14px", fontWeight: 700 }}>Unit Price</th>
                            <th style={{ padding: "10px 14px", fontWeight: 700, textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it, idx) => {
                            const itemIdFormatted = it.itemId || `${ord.id}_${it.productId}_${it.quantity}`;
                            const subtotalVal = it.subtotal || it.quantity * it.unitPrice;

                            return (
                              <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, color: "var(--accent)" }}>
                                  {itemIdFormatted}
                                </td>
                                <td style={{ padding: "10px 14px", fontWeight: 600 }}>
                                  {it.isKids ? "🎈 " : "🛍️ "}{it.productName}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                  <span style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "3px 8px", borderRadius: 4, fontWeight: 700, fontSize: 12 }}>
                                    {it.size}
                                  </span>
                                </td>
                                <td style={{ padding: "10px 14px", fontWeight: 700 }}>{it.quantity}</td>
                                <td style={{ padding: "10px 14px" }}>₹{it.unitPrice}</td>
                                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--accent)", textAlign: "right" }}>
                                  ₹{subtotalVal}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ORDER SUMMARY FOOTER */}
                <div
                  style={{
                    padding: "14px 24px",
                    background: "var(--bg2)",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <div style={{ background: "var(--accent)", color: "#ffffff", padding: "6px 16px", borderRadius: 8, fontWeight: 800, fontSize: 15 }}>
                    Grand Total: ₹{ord.totalAmount}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
