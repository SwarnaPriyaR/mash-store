"use client";

/**
 * app/orders/OrdersClient.tsx
 * Customer Order Details & History page automatically linked with logged-in user email.
 * Stripped of all special emoji characters for a sleek, elegant aesthetic.
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { AuthModal } from "@/components/AuthModal";
import type { OrderData } from "@/lib/db";

export function OrdersClient() {
  const { loggedIn, user, userEmail, handleLogin } = useCart();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(false);
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);

  // Derive effective email address
  const activeEmail = userEmail || (user && user.includes("@") ? user : null);

  const fetchOrders = useCallback(async (email: string) => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/customer?email=${encodeURIComponent(email.trim())}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (loggedIn && activeEmail) {
      fetchOrders(activeEmail);
    } else {
      setOrders([]);
    }
  }, [loggedIn, activeEmail, fetchOrders]);

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
    <div className="products-page" style={{ paddingBottom: 64, maxWidth: 1040, margin: "0 auto", paddingLeft: 16, paddingRight: 16 }}>
      {/* PAGE HEADER */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span className="sale-tag" style={{ fontSize: 11, letterSpacing: "0.1em", padding: "4px 12px", marginBottom: 12, display: "inline-block" }}>
          CUSTOMER PORTAL
        </span>
        <h1 className="products-title" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", margin: "8px 0" }}>
          MY ORDERS
        </h1>
        <p style={{ color: "var(--text2)", fontSize: 15, maxWidth: 540, margin: "0 auto" }}>
          View your complete order history, live delivery progress, and line item receipts.
        </p>
      </div>

      {/* NOT LOGGED IN STATE */}
      {!loggedIn ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            maxWidth: 520,
            margin: "0 auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--text)" }}>
            Please Log In to View Your Orders
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Log in or create an account with your registered email to automatically access your order history and live delivery updates.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setAuthModal("login")}
            style={{ padding: "12px 28px", fontSize: 14, cursor: "pointer" }}
          >
            LOG IN / SIGN UP
          </button>
        </div>
      ) : loading ? (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--text2)" }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Fetching your order details...</div>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "var(--surface)",
            border: "1px dashed var(--border)",
            borderRadius: 16,
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>No Orders Found</h3>
          <p style={{ color: "var(--text2)", fontSize: 14, maxWidth: 420, margin: "0 auto 20px" }}>
            No order history linked with account <b>{activeEmail}</b>.
          </p>
          <Link href="/products" className="btn-primary" style={{ textDecoration: "none", display: "inline-block", padding: "10px 20px", fontSize: 14 }}>
            Browse Streetwear Collection
          </Link>
        </div>
      ) : (
        <div>
          {/* LOGGED IN ACCOUNT BADGE */}
          <div style={{ marginBottom: 20, fontSize: 13, color: "var(--text2)", fontWeight: 600 }}>
            Showing orders for <b>{activeEmail}</b> ({orders.length} orders recorded)
          </div>

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
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                  }}
                >
                  {/* ORDER HEADER */}
                  <div
                    style={{
                      padding: "16px 24px",
                      background: "var(--bg2)",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: "var(--accent)", letterSpacing: "0.02em" }}>
                        Order {ord.id}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      {/* PAYMENT STATUS BADGE */}
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 700,
                          background: ord.status === "Paid" ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                          color: ord.status === "Paid" ? "#16a34a" : "#dc2626",
                          border: ord.status === "Paid" ? "1px solid #16a34a" : "1px solid #dc2626",
                        }}
                      >
                        Payment: {ord.status}
                      </span>

                      {/* DELIVERY STATUS BADGE */}
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 99,
                          fontSize: 12,
                          fontWeight: 700,
                          background: isReturn ? "rgba(217,119,6,0.12)" : "var(--bg)",
                          color: isReturn ? "#d97706" : "var(--text)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        Status: {ord.orderStatus || "Order Received"}
                      </span>
                    </div>
                  </div>

                  {/* DELIVERY TRACKER */}
                  <div style={{ padding: "18px 24px", background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text2)", marginBottom: 12 }}>
                      DELIVERY PROGRESS TRACKER
                    </div>

                    {isReturn ? (
                      <div style={{ background: "rgba(217,119,6,0.1)", color: "#b45309", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                        Order is currently under Return / Refund processing.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, position: "relative" }}>
                        {[
                          { title: "Order Received", stepNum: 1 },
                          { title: "In Progress", stepNum: 2 },
                          { title: "In Transit", stepNum: 3 },
                          { title: "Delivered", stepNum: 4 },
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
                              <div style={{ fontSize: 12, fontWeight: isDone ? 700 : 500, color: isCurrent ? "var(--accent)" : "var(--text)" }}>
                                {st.title}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ORDER LINE ITEMS SUB-TABLE */}
                  <div style={{ padding: "18px 24px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text2)", marginBottom: 12 }}>
                      ORDER LINE ITEMS ({items.length} ITEMS)
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
                                    {it.productName}
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

                  {/* SUMMARY FOOTER */}
                  <div
                    style={{
                      padding: "14px 24px",
                      background: "var(--bg2)",
                      borderTop: "1px solid var(--border)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ background: "var(--accent)", color: "#ffffff", padding: "6px 16px", borderRadius: 8, fontWeight: 800, fontSize: 14 }}>
                      Grand Total: ₹{ord.totalAmount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={(name) => {
            handleLogin(name);
            setAuthModal(null);
          }}
          switchMode={(m) => setAuthModal(m)}
        />
      )}
    </div>
  );
}
