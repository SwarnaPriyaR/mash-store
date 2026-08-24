"use client";

/**
 * components/AdminPortal.tsx
 * Admin management portal for Adult Products, Kids Products, and Manual Orders.
 * Includes category dropdowns, per-size stock management, Order Status dropdowns, and cumulative amounts.
 */

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { useSale } from "./SaleProvider";
import { convertDriveUrl, DEFAULT_SALE, getSizeStock, getAvailableSizes, embedSizeStockInDescription, getSalePrice } from "@/lib/helpers";
import type { Product, KidsProduct, OrderData } from "@/lib/db";

type AdminProduct = Product & { price: number; sizeStock: Record<string, number> };
type AdminKidsProduct = KidsProduct & { price: number; sizeStock: Record<string, number> };

export function AdminPortal() {
  const { sale, setSale } = useSale();
  const [mounted, setMounted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [toast, setToastMsg] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState("dashboard");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Adult Product Form state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [expandAddForm, setExpandAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    category: "Men",
    fit: "Regular",
    image: "",
    tags: "Streetwear, Casual",
    description: "Premium heavy cotton adult clothing.",
    sizeStock: { S: 5, M: 10, L: 8, XL: 4 } as Record<string, number>,
  });

  // Kids Product Form state
  const [kidsProducts, setKidsProducts] = useState<AdminKidsProduct[]>([]);
  const [expandKidsAddForm, setExpandKidsAddForm] = useState(false);
  const [newKidsProd, setNewKidsProd] = useState({
    name: "",
    price: "",
    category: "Girl",
    image: "",
    tags: "Kids, Party, Cute",
    description: "Soft organic cotton dress for kids.",
    sizeStock: { "2–3 Years": 5, "4–5 Years": 8, "6–7 Years": 6, "8–9 Years": 3 } as Record<string, number>,
  });

  // Manual Orders state
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [expandOrderForm, setExpandOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    id: "",
    customerId: "",
    status: "Not Paid",
    orderStatus: "Order Received",
  });

  const [orderItems, setOrderItems] = useState<{
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    size: string;
    isKids: boolean;
  }[]>([]);
  const [orderIdFilter, setOrderIdFilter] = useState("");
  const [orderSelectedProduct, setOrderSelectedProduct] = useState<Record<string, string>>({});

  // Sale Scheduler state
  const [saleForm, setSaleForm] = useState({
    discount: sale.discount || 20,
    durationHours: sale.durationHours || 24,
    mode: "instant" as "instant" | "scheduled",
    target: (sale.target || "both") as "both" | "adult" | "kids",
    startTime: "",
  });

  const [editValues, setEditValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (orderItems.length > 0) {
      const calculated = orderItems.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
      setNewOrder((prev) => ({ ...prev, totalAmount: String(calculated) }));
    }
  }, [orderItems]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/product/allProduct");
      if (res.ok) {
        const data: Product[] = await res.json();
        setProducts(
          data.map((p) => ({
            ...p,
            price: isSaleActive ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice,
            image: convertDriveUrl(p.image),
            sizeStock: getSizeStock(p),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to refresh adult products:", err);
    }
  }, [isSaleActive, sale.discount]);

  const refreshKidsProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/kids/allProduct");
      if (res.ok) {
        const data: KidsProduct[] = await res.json();
        setKidsProducts(
          data.map((kp) => ({
            ...kp,
            price: isSaleActive ? Math.round(kp.basePrice * (1 - sale.discount / 100)) : kp.basePrice,
            image: convertDriveUrl(kp.image),
            sizeStock: getSizeStock(kp),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to refresh kids products:", err);
    }
  }, [isSaleActive, sale.discount]);

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/allOrder");
      if (res.ok) {
        const data: OrderData[] = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/admin-check")
      .then((res) => res.json())
      .then((data) => {
        if (data.authed) {
          setAuthed(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authed) {
      refreshProducts();
      refreshKidsProducts();
      refreshOrders();
    }
  }, [authed, refreshProducts, refreshKidsProducts, refreshOrders]);

  const handleLoginSubmit = async () => {
    if (!adminPass.trim()) {
      showToast("Please enter a password");
      return;
    }

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAuthed(true);
        showToast("Access Granted");
      } else {
        showToast("Incorrect Password");
      }
    } catch {
      showToast("Failed to validate password");
    }
  };

  // Dashboard Stats Calculations
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const ordersThisWeek = orders.filter((o) => {
    const createdTime = o.createdAt ? new Date(o.createdAt).getTime() : now;
    return now - createdTime <= oneWeekMs;
  }).length;

  const paidOrdersCount = orders.filter((o) => o.status === "Paid").length;
  const nonPaidOrdersCount = orders.filter((o) => o.status === "Not Paid").length;

  const cumulativeTotalPaid = orders.filter((o) => o.status === "Paid").reduce((acc, o) => acc + o.totalAmount, 0);
  const cumulativeTotalNonPaid = orders.filter((o) => o.status === "Not Paid").reduce((acc, o) => acc + o.totalAmount, 0);

  // Adult Product Handlers
  const handleAddProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) { showToast("Product name is required"); return; }
    const baseP = parseInt(newProd.price);
    if (isNaN(baseP) || baseP <= 0) { showToast("Base price must be positive"); return; }

    const sizeStockMap = newProd.sizeStock;
    const totalQty = Object.values(sizeStockMap).reduce((sum, count) => sum + Math.max(0, count || 0), 0);
    const updatedDesc = embedSizeStockInDescription(newProd.description, sizeStockMap);

    const payload = {
      name: newProd.name.trim(),
      basePrice: baseP,
      qty: totalQty,
      fit: newProd.fit,
      category: newProd.category,
      sizes: Object.keys(sizeStockMap),
      image: convertDriveUrl(newProd.image.trim()) || "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
      tags: [newProd.category, ...newProd.tags.split(",").map((t) => t.trim()).filter(Boolean)],
      description: updatedDesc,
    };

    try {
      const res = await fetch("/api/product/addNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const created: Product = await res.json();
      const finalPrice = isSaleActive ? Math.round(created.basePrice * (1 - sale.discount / 100)) : created.basePrice;
      setProducts((prev) => [
        ...prev,
        {
          ...created,
          price: finalPrice,
          image: convertDriveUrl(created.image),
          sizeStock: sizeStockMap,
        },
      ]);
      setNewProd({
        name: "",
        price: "",
        category: "Men",
        fit: "Regular",
        image: "",
        tags: "Streetwear, Casual",
        description: "Premium heavy cotton adult clothing.",
        sizeStock: { S: 5, M: 10, L: 8, XL: 4 },
      });
      setExpandAddForm(false);
      showToast(`🎉 "${created.name}" saved! Total cumulative stock: ${totalQty}`);
    } catch (err) {
      showToast(`❌ Add product failed: ${String(err)}`);
    }
  }, [newProd, isSaleActive, sale.discount, showToast]);

  const updateProductStock = useCallback(async (p: AdminProduct, sz: string, val: string) => {
    const parsed = Math.max(0, parseInt(val) || 0);
    const updatedSizeStock = { ...p.sizeStock, [sz]: parsed };
    const cumulativeTotal = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0);
    const updatedDesc = embedSizeStockInDescription(p.description, updatedSizeStock);

    setProducts((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, qty: cumulativeTotal, sizeStock: updatedSizeStock, description: updatedDesc } : item))
    );

    try {
      const res = await fetch(`/api/product/updateProduct/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: cumulativeTotal, description: updatedDesc }),
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(`⚡ ${p.name} (${sz}) updated to ${parsed}. Total stock: ${cumulativeTotal}`);
    } catch {
      showToast("❌ Failed to update size stock");
      await refreshProducts();
    }
  }, [showToast, refreshProducts]);

  const removeProduct = useCallback(async (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/product/removeProduct/${id}`, { method: "DELETE" });
      showToast("🗑 Adult Product removed");
    } catch {
      await refreshProducts();
    }
  }, [refreshProducts, showToast]);

  // Kids Product Handlers
  const handleAddKidsProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidsProd.name.trim()) { showToast("Kids product name is required"); return; }
    const baseP = parseInt(newKidsProd.price);
    if (isNaN(baseP) || baseP <= 0) { showToast("Base price must be positive"); return; }

    const sizeStockMap = newKidsProd.sizeStock;
    const totalQty = Object.values(sizeStockMap).reduce((sum, count) => sum + Math.max(0, count || 0), 0);
    const updatedDesc = embedSizeStockInDescription(newKidsProd.description, sizeStockMap);

    const payload = {
      name: newKidsProd.name.trim(),
      basePrice: baseP,
      qty: totalQty,
      sizes: Object.keys(sizeStockMap),
      image: convertDriveUrl(newKidsProd.image.trim()) || "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
      tags: [newKidsProd.category, ...newKidsProd.tags.split(",").map((t) => t.trim()).filter(Boolean)],
      description: updatedDesc,
    };

    try {
      const res = await fetch("/api/kids/addNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const created: KidsProduct = await res.json();
      const finalPrice = isSaleActive ? Math.round(created.basePrice * (1 - sale.discount / 100)) : created.basePrice;
      setKidsProducts((prev) => [
        ...prev,
        {
          ...created,
          price: finalPrice,
          image: convertDriveUrl(created.image),
          sizeStock: sizeStockMap,
        },
      ]);
      setNewKidsProd({
        name: "",
        price: "",
        category: "Girl",
        image: "",
        tags: "Kids, Party, Cute",
        description: "Soft organic cotton dress for kids.",
        sizeStock: { "2–3 Years": 5, "4–5 Years": 8, "6–7 Years": 6, "8–9 Years": 3 },
      });
      setExpandKidsAddForm(false);
      showToast(`🎉 "${created.name}" saved! Total cumulative stock: ${totalQty}`);
    } catch (err) {
      showToast(`❌ Add kids product failed: ${String(err)}`);
    }
  }, [newKidsProd, isSaleActive, sale.discount, showToast]);

  const updateKidsProductStock = useCallback(async (kp: AdminKidsProduct, sz: string, val: string) => {
    const parsed = Math.max(0, parseInt(val) || 0);
    const updatedSizeStock = { ...kp.sizeStock, [sz]: parsed };
    const cumulativeTotal = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0);
    const updatedDesc = embedSizeStockInDescription(kp.description, updatedSizeStock);

    setKidsProducts((prev) =>
      prev.map((item) => (item.id === kp.id ? { ...item, qty: cumulativeTotal, sizeStock: updatedSizeStock, description: updatedDesc } : item))
    );

    try {
      const res = await fetch(`/api/kids/updateProduct/${kp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: cumulativeTotal, description: updatedDesc }),
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(`⚡ Kids product (${sz}) updated to ${parsed}. Total stock: ${cumulativeTotal}`);
    } catch {
      showToast("❌ Failed to update kids size stock");
      await refreshKidsProducts();
    }
  }, [showToast, refreshKidsProducts]);

  const removeKidsProduct = useCallback(async (id: number) => {
    setKidsProducts((prev) => prev.filter((kp) => kp.id !== id));
    try {
      await fetch(`/api/kids/removeProduct/${id}`, { method: "DELETE" });
      showToast("🗑 Kids Product removed");
    } catch {
      await refreshKidsProducts();
    }
  }, [refreshKidsProducts, showToast]);

  const handleAddOrder = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrder.customerId.trim()) { showToast("Customer ID (email) is required"); return; }

    let formattedId = newOrder.id.trim();
    if (formattedId && !formattedId.toUpperCase().startsWith("O")) {
      formattedId = `O-${formattedId}`;
    }

    try {
      const res = await fetch("/api/orders/addNew", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: formattedId,
          customerId: newOrder.customerId.trim(),
          items: [],
          totalAmount: 0,
          status: newOrder.status,
          orderStatus: newOrder.orderStatus,
        }),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const created: OrderData = await res.json();
      setOrders((prev) => [created, ...prev]);
      setNewOrder({ id: "", customerId: "", status: "Not Paid", orderStatus: "Order Received" });
      setOrderItems([]);
      setExpandOrderForm(false);

      if (newOrder.status === "Paid") {
        await refreshProducts();
        await refreshKidsProducts();
      }

      showToast(`🎉 Order ${created.id} created successfully!`);
    } catch (err) {
      showToast(`❌ Failed to create order: ${String(err)}`);
    }
  }, [newOrder, orderItems, showToast, refreshProducts, refreshKidsProducts]);

  const handleUpdateOrder = useCallback(async (id: string, updates: { status?: string; orderStatus?: string }) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
    try {
      await fetch(`/api/orders/updateOrder/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (updates.status) {
        await refreshProducts();
        await refreshKidsProducts();
        if (updates.status === "Paid") {
          showToast(`⚡ Order ${id} marked as Paid & Stock reduced!`);
        } else if (updates.status === "Not Paid") {
          showToast(`⚡ Order ${id} marked as Not Paid & Stock restored!`);
        }
      } else {
        showToast(`⚡ Order ${id} updated`);
      }
    } catch {
      showToast("❌ Failed to update order");
      await refreshOrders();
    }
  }, [showToast, refreshOrders, refreshProducts, refreshKidsProducts]);

  const handleRemoveOrder = useCallback(async (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    try {
      await fetch(`/api/orders/removeOrder/${id}`, { method: "DELETE" });
      showToast(`🗑️ Order ${id} deleted`);
    } catch {
      showToast("❌ Failed to delete order");
      await refreshOrders();
    }
  }, [showToast, refreshOrders]);

  const handleAddItemToOrder = useCallback(async (
    orderId: string,
    selectedProductKey: string,
    selectedSize: string,
    quantity: number
  ) => {
    if (!selectedProductKey) {
      showToast("❌ Please select a product to add");
      return;
    }

    const [type, idStr] = selectedProductKey.split("_");
    const id = parseInt(idStr);
    let pName = "";
    let pPrice = 0;
    let isKids = false;

    if (type === "adult") {
      const p = products.find((x) => x.id === id);
      if (p) {
        pName = p.name;
        const salePrice = getSalePrice(p, sale, false);
        pPrice = salePrice !== null ? salePrice : p.basePrice;
      }
    } else {
      const kp = kidsProducts.find((x) => x.id === id);
      if (kp) {
        pName = kp.name;
        const salePrice = getSalePrice(kp, sale, true);
        pPrice = salePrice !== null ? salePrice : kp.basePrice;
        isKids = true;
      }
    }

    if (!pName) return;

    try {
      const res = await fetch("/api/orders/addItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          productId: id,
          productName: pName,
          size: selectedSize,
          quantity,
          unitPrice: pPrice,
          isKids,
        }),
      });

      if (!res.ok) throw new Error("Failed to add order item");
      const updated: OrderData = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      showToast(`🎉 Item added to Order ${orderId}!`);
    } catch (err) {
      showToast(`❌ Failed to add order item: ${String(err)}`);
    }
  }, [products, kidsProducts, sale, showToast, refreshProducts, refreshKidsProducts]);

  const handleRemoveOrderItem = useCallback(async (orderId: string, itemId: string) => {
    try {
      const res = await fetch(`/api/orders/removeItem/${encodeURIComponent(itemId)}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");
      const updated: OrderData = await res.json();

      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

      if (updated.status === "Paid") {
        await refreshProducts();
        await refreshKidsProducts();
      }

      showToast(`🗑️ Line item removed from Order ${orderId}`);
    } catch (err) {
      showToast(`❌ Failed to remove line item: ${String(err)}`);
    }
  }, [showToast, refreshProducts, refreshKidsProducts]);

  const handleSetSale = (e: React.FormEvent) => {
    e.preventDefault();
    let startMs = Date.now();
    if (saleForm.mode === "scheduled" && saleForm.startTime) {
      startMs = new Date(saleForm.startTime).getTime();
    }
    const durationMs = saleForm.durationHours * 3600 * 1000;
    const endMs = startMs + durationMs;

    setSale({
      active: true,
      discount: saleForm.discount,
      start: startMs,
      end: endMs,
      startTime: saleForm.mode === "scheduled" ? startMs : null,
      durationHours: saleForm.durationHours,
      target: saleForm.target,
    });

    showToast(
      saleForm.mode === "instant"
        ? `⚡ Instant ${saleForm.discount}% Flash Sale Activated!`
        : `📅 Sale Scheduled for ${new Date(startMs).toLocaleString()}!`
    );
  };

  const handleCancelSale = () => {
    setSale({
      active: false,
      discount: 0,
      start: 0,
      end: 0,
      startTime: null,
      durationHours: 0,
    });
    showToast("🛑 Flash Sale Deactivated");
  };

  if (!mounted) return null;

  if (!authed) {
    return (
      <div className="modal-overlay" style={{ background: "rgba(10,8,6,0.92)", backdropFilter: "blur(8px)" }}>
        <div className="modal" style={{ background: "#141210", border: "1px solid #2e2823", width: "360px", color: "#f0ebe3" }}>
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <div style={{ width: "48px", height: "48px", background: "rgba(200,75,47,0.15)", color: "var(--accent)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="modal-title" style={{ color: "#f0ebe3", fontSize: "20px" }}>ADMIN PORTAL</h2>
            <p className="modal-sub" style={{ color: "#8a8075" }}>Password required for access</p>
          </div>
          <div className="form-field">
            <label className="form-label" style={{ color: "#8a8075" }}>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLoginSubmit()}
              style={{ background: "#1e1b19", borderColor: "#3a3530", color: "#f0ebe3" }}
            />
          </div>
          <button className="modal-submit" onClick={handleLoginSubmit} style={{ marginTop: "12px", background: "var(--accent)" }}>
            ENTER SYSTEM
          </button>
        </div>
        {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin-logout", { method: "POST" });
    } catch {}
    setAuthed(false);
    showToast("Logged out of Admin Portal");
  };

  return (
    <div className="admin-portal-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo" onClick={() => setCurrentSection("dashboard")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <img src="/asset/logoLight.png" alt="MASH" style={{ height: 34, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: "14px", background: "var(--accent)", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>ADMIN</span>
          </div>
          <ul className="admin-sidebar-menu">
            <li><button className={`admin-sidebar-btn ${currentSection === "dashboard" ? "active" : ""}`} onClick={() => setCurrentSection("dashboard")}>📊 Dashboard</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "inventory" ? "active" : ""}`} onClick={() => setCurrentSection("inventory")}>👕 Adult Products</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "kids-inventory" ? "active" : ""}`} onClick={() => setCurrentSection("kids-inventory")}>🎈 Kids Products</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "sale" ? "active" : ""}`} onClick={() => setCurrentSection("sale")}>⚡ Sale Scheduler</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "orders" ? "active" : ""}`} onClick={() => setCurrentSection("orders")}>📋 Manual Orders</button></li>
          </ul>
        </div>
        <div className="admin-sidebar-footer">
          <Link href="/" className="admin-sidebar-btn" style={{ border: "1px solid var(--border)", textDecoration: "none", display: "block", padding: "12px 16px" }}>
            🌐 Live Storefront ↗
          </Link>
          <button className="admin-sidebar-btn" onClick={handleLogout} style={{ color: "var(--accent)", border: "1.5px solid var(--accent)", fontWeight: "600" }}>
            🚪 Exit Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main-content">
        {/* DASHBOARD */}
        {currentSection === "dashboard" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">DASHBOARD OVERVIEW</h1>
                <p className="admin-sub">Stock, order & catalog statistics for MASH store</p>
              </div>
            </header>
            <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              <div className="admin-stat-card purple"><span className="admin-stat-title">Adult Products</span><span className="admin-stat-number">{products.length}</span></div>
              <div className="admin-stat-card green"><span className="admin-stat-title">Kids Products</span><span className="admin-stat-number">{kidsProducts.length}</span></div>
              <div className="admin-stat-card orange"><span className="admin-stat-title">Total Orders</span><span className="admin-stat-number">{orders.length}</span></div>
              <div className="admin-stat-card accent"><span className="admin-stat-title">Orders This Week</span><span className="admin-stat-number">{ordersThisWeek}</span></div>
              <div className="admin-stat-card green"><span className="admin-stat-title">Paid Orders</span><span className="admin-stat-number">{paidOrdersCount}</span></div>
              <div className="admin-stat-card purple" style={{ borderColor: "#ef4444" }}><span className="admin-stat-title">Non-Paid Orders</span><span className="admin-stat-number" style={{ color: "#dc2626" }}>{nonPaidOrdersCount}</span></div>
              <div className="admin-stat-card orange"><span className="admin-stat-title">Total Adult Stock</span><span className="admin-stat-number">{products.reduce((acc, p) => acc + p.qty, 0)}</span></div>
              <div className="admin-stat-card green"><span className="admin-stat-title">Total Kids Stock</span><span className="admin-stat-number">{kidsProducts.reduce((acc, p) => acc + p.qty, 0)}</span></div>
            </div>
          </div>
        )}

        {/* ADULT PRODUCTS INVENTORY */}
        {currentSection === "inventory" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">ADULT PRODUCTS INVENTORY</h1>
                <p className="admin-sub">Category selector & per-size stock management (S, M, L, XL)</p>
              </div>
            </header>
            <div className="admin-form-header" onClick={() => setExpandAddForm(!expandAddForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span>{expandAddForm ? "➖ HIDE ADD ADULT PRODUCT FORM" : "➕ ADD NEW ADULT PRODUCT"}</span>
              <span>{expandAddForm ? "▲" : "▼"}</span>
            </div>
            {expandAddForm && (
              <form className="admin-form-body" onSubmit={handleAddProduct}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Product Name *</label><input className="form-input" placeholder="e.g. Heavyweight Cotton Oversized Tee" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Base Price (INR) *</label><input className="form-input" type="number" placeholder="e.g. 799" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required /></div>

                  <div className="form-field">
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}>
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fit Style</label>
                    <select className="form-input" value={newProd.fit} onChange={(e) => setNewProd({ ...newProd, fit: e.target.value })}>
                      <option value="Regular">Regular</option>
                      <option value="Oversized">Oversized</option>
                    </select>
                  </div>
                </div>

                <div className="form-field"><label className="form-label">Image URL</label><input className="form-input" placeholder="https://..." value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} /></div>

                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Per-Size Stock Setup (Adult Sizes)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {["S", "M", "L", "XL"].map((sz) => (
                      <div key={sz} style={{ background: "var(--bg2)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>Size {sz}</label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          value={newProd.sizeStock[sz] ?? 0}
                          onChange={(e) => setNewProd({ ...newProd, sizeStock: { ...newProd.sizeStock, [sz]: parseInt(e.target.value) || 0 } })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="admin-action-btn" style={{ background: "#1a1714", color: "#fff", padding: "12px 24px", marginTop: 14 }}>
                  Save Adult Product
                </button>
              </form>
            )}

            <div className="admin-card">
              <div className="admin-card-title">👕 Adult Catalog List</div>
              {products.map((p) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 1fr 48px", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <img src={p.image} alt={p.name} className="admin-thumb" />
                  <div>
                    <div className="admin-name">{p.name}</div>
                    <div className="admin-id">Category: {p.category || "Men"} · Total Stock: {p.qty}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>₹{p.basePrice}</span>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["S", "M", "L", "XL"].map((sz) => {
                      const count = p.sizeStock[sz] ?? 0;
                      return (
                        <div key={sz} style={{ display: "flex", alignItems: "center", gap: 4, background: count === 0 ? "#fee2e2" : "var(--bg2)", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 10, fontWeight: 700 }}>{sz}:</span>
                          <input
                            type="number"
                            min="0"
                            style={{ width: 36, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                            value={editValues[`p_${p.id}_${sz}`] ?? count}
                            onChange={(e) => setEditValues({ ...editValues, [`p_${p.id}_${sz}`]: e.target.value })}
                            onBlur={(e) => {
                              if (e.target.value !== "") updateProductStock(p, sz, e.target.value);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button className="admin-del-btn" onClick={() => removeProduct(p.id)}><Icon.Trash /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KIDS PRODUCTS INVENTORY */}
        {currentSection === "kids-inventory" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">KIDS PRODUCTS INVENTORY</h1>
                <p className="admin-sub">Category selector & per-size stock management (2–3Y, 4–5Y, 6–7Y, 8–9Y)</p>
              </div>
            </header>

            <div className="admin-form-header" onClick={() => setExpandKidsAddForm(!expandKidsAddForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span>{expandKidsAddForm ? "➖ HIDE ADD KIDS PRODUCT FORM" : "➕ ADD NEW KIDS PRODUCT"}</span>
              <span>{expandKidsAddForm ? "▲" : "▼"}</span>
            </div>

            {expandKidsAddForm && (
              <form className="admin-form-body" onSubmit={handleAddKidsProduct}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Kids Product Name *</label><input className="form-input" placeholder="e.g. Floral Princess Frock" value={newKidsProd.name} onChange={(e) => setNewKidsProd({ ...newKidsProd, name: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Base Price (INR) *</label><input className="form-input" type="number" placeholder="e.g. 599" value={newKidsProd.price} onChange={(e) => setNewKidsProd({ ...newKidsProd, price: e.target.value })} required /></div>

                  <div className="form-field">
                    <label className="form-label">Category *</label>
                    <select className="form-input" value={newKidsProd.category} onChange={(e) => setNewKidsProd({ ...newKidsProd, category: e.target.value })}>
                      <option value="Girl">Girl</option>
                      <option value="Boy">Boy</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="form-field"><label className="form-label">Image URL</label><input className="form-input" placeholder="https://..." value={newKidsProd.image} onChange={(e) => setNewKidsProd({ ...newKidsProd, image: e.target.value })} /></div>

                <div style={{ marginTop: 16 }}>
                  <label className="form-label">Per-Size Stock Setup (Kids Age Groups)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"].map((sz) => (
                      <div key={sz} style={{ background: "var(--bg2)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <label style={{ fontSize: 11, fontWeight: 700 }}>{sz}</label>
                        <input
                          type="number"
                          min="0"
                          className="form-input"
                          value={newKidsProd.sizeStock[sz] ?? 0}
                          onChange={(e) => setNewKidsProd({ ...newKidsProd, sizeStock: { ...newKidsProd.sizeStock, [sz]: parseInt(e.target.value) || 0 } })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="admin-action-btn" style={{ background: "#1a1714", color: "#fff", padding: "12px 24px", marginTop: 14 }}>
                  Save Kids Product
                </button>
              </form>
            )}

            <div className="admin-card">
              <div className="admin-card-title">🎈 Kids Catalog List</div>
              {kidsProducts.map((kp) => (
                <div key={kp.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 110px 1fr 48px", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <img src={kp.image} alt={kp.name} className="admin-thumb" />
                  <div>
                    <div className="admin-name">{kp.name}</div>
                    <div className="admin-id">Category: {kp.tags?.[0] || "Girl"} · Total Stock: {kp.qty}</div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>₹{kp.basePrice}</span>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"].map((sz) => {
                      const count = kp.sizeStock[sz] ?? 0;
                      const shortLabel = sz.replace(" Years", "Y");
                      return (
                        <div key={sz} style={{ display: "flex", alignItems: "center", gap: 4, background: count === 0 ? "#fee2e2" : "var(--bg2)", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 10, fontWeight: 700 }}>{shortLabel}:</span>
                          <input
                            type="number"
                            min="0"
                            style={{ width: 40, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                            value={editValues[`k_${kp.id}_${sz}`] ?? count}
                            onChange={(e) => setEditValues({ ...editValues, [`k_${kp.id}_${sz}`]: e.target.value })}
                            onBlur={(e) => {
                              if (e.target.value !== "") updateKidsProductStock(kp, sz, e.target.value);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <button className="admin-del-btn" onClick={() => removeKidsProduct(kp.id)}><Icon.Trash /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALE SCHEDULER SECTION */}
        {currentSection === "sale" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">FLASH SALE SCHEDULER</h1>
                <p className="admin-sub">Set global discounts, instant sales, or scheduled countdown offers across all store products</p>
              </div>
            </header>

            {/* CURRENT SALE STATUS BANNER */}
            <div
              style={{
                background: isSaleActive ? "#dcfce7" : "var(--bg2)",
                border: isSaleActive ? "1.5px solid #16a34a" : "1px solid var(--border)",
                borderRadius: 14,
                padding: "20px 24px",
                marginBottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: isSaleActive ? "#15803d" : "var(--text2)" }}>
                  {isSaleActive ? "ACTIVE STOREWIDE SALE" : "NO SALE CURRENTLY ACTIVE"}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4, color: isSaleActive ? "#15803d" : "var(--text)" }}>
                  {isSaleActive ? `${sale.discount}% OFF STOREWIDE` : "Standard Catalog Pricing"}
                </div>
                {isSaleActive && (
                  <div style={{ fontSize: 13, color: "#166534", marginTop: 4 }}>
                    Sale ends on: <b>{new Date(sale.end).toLocaleString("en-IN")}</b>
                  </div>
                )}
              </div>

              {isSaleActive && (
                <button
                  type="button"
                  onClick={handleCancelSale}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    border: "none",
                    background: "#dc2626",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  STOP & CANCEL SALE
                </button>
              )}
            </div>

            {/* SALE SCHEDULER FORM */}
            <div className="admin-card" style={{ marginBottom: 24 }}>
              <div className="admin-card-title">⚡ Configure Storewide Flash Sale</div>
              <form onSubmit={handleSetSale}>
                <div className="sale-form">
                  <div className="form-field">
                    <label className="form-label">Activation Mode</label>
                    <select
                      className="form-input"
                      value={saleForm.mode}
                      onChange={(e) => setSaleForm({ ...saleForm, mode: e.target.value as "instant" | "scheduled" })}
                    >
                      <option value="instant">Instant Activation (Right Now)</option>
                      <option value="scheduled">Scheduled Date & Time</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Apply Discount To *</label>
                    <select
                      className="form-input"
                      value={saleForm.target}
                      onChange={(e) => setSaleForm({ ...saleForm, target: e.target.value as "both" | "adult" | "kids" })}
                    >
                      <option value="both">Both Adult & Kids Products</option>
                      <option value="adult">Only Adult Streetwear Products</option>
                      <option value="kids">Only Kids Products</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      max={90}
                      value={saleForm.discount}
                      onChange={(e) => setSaleForm({ ...saleForm, discount: Math.min(90, Math.max(1, parseInt(e.target.value) || 1)) })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Duration (Hours)</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      max={720}
                      value={saleForm.durationHours}
                      onChange={(e) => setSaleForm({ ...saleForm, durationHours: Math.max(1, parseInt(e.target.value) || 1) })}
                      required
                    />
                  </div>

                  {saleForm.mode === "scheduled" && (
                    <div className="form-field full">
                      <label className="form-label">Offer Starting Date & Time</label>
                      <input
                        className="form-input"
                        type="datetime-local"
                        value={saleForm.startTime}
                        onChange={(e) => setSaleForm({ ...saleForm, startTime: e.target.value })}
                        required
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="admin-action-btn"
                  style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", padding: "12px 28px", marginTop: "20px", fontSize: "14px" }}
                >
                  {saleForm.mode === "instant" ? "Activate Instant Sale" : "Lock & Schedule Offer"}
                </button>
              </form>
            </div>

            {/* DISCOUNTED PRICES PREVIEW PANEL */}
            <div className="admin-card">
              <div className="admin-card-title">
                Prices Preview Panel ({saleForm.discount}% Discount — {saleForm.target === "both" ? "Both Adult & Kids" : saleForm.target === "adult" ? "Only Adult Products" : "Only Kids Products"})
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
                {/* ADULT PRODUCTS PREVIEW */}
                {(saleForm.target === "both" || saleForm.target === "adult") &&
                  products.map((p) => {
                    const saleP = Math.round(p.basePrice * (1 - saleForm.discount / 100));
                    return (
                      <div key={`adult_${p.id}`} style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(200,75,47,0.15)", color: "var(--accent)", padding: "2px 8px", borderRadius: 4 }}>
                            Adult Tee #{p.id}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{p.fit}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{p.name}</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                          <span style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 22, color: "var(--accent)", fontWeight: 800 }}>
                            ₹{saleP}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--text2)", textDecoration: "line-through", fontWeight: 600 }}>
                            ₹{p.basePrice}
                          </span>
                          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginLeft: "auto" }}>
                            Save ₹{p.basePrice - saleP}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* KIDS PRODUCTS PREVIEW */}
                {(saleForm.target === "both" || saleForm.target === "kids") &&
                  kidsProducts.map((kp) => {
                    const saleP = Math.round(kp.basePrice * (1 - saleForm.discount / 100));
                    return (
                      <div key={`kids_${kp.id}`} style={{ background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 8px", borderRadius: 4 }}>
                            Kids Item #{kp.id}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{kp.tags?.[0] || "Kids"}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>{kp.name}</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                          <span style={{ fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif", fontSize: 22, color: "var(--accent)", fontWeight: 800 }}>
                            ₹{saleP}
                          </span>
                          <span style={{ fontSize: 13, color: "var(--text2)", textDecoration: "line-through", fontWeight: 600 }}>
                            ₹{kp.basePrice}
                          </span>
                          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700, marginLeft: "auto" }}>
                            Save ₹{kp.basePrice - saleP}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* MANUAL ORDERS SECTION */}
        {currentSection === "orders" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">MANUAL ORDER DETAILS</h1>
                <p className="admin-sub">Manual & automated order entries with payment status and delivery tracking</p>
              </div>
            </header>

            {/* CUMULATIVE TOTAL SUMMARY CARDS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div
                style={{
                  background: "#dcfce7",
                  border: "1.5px solid #16a34a",
                  borderRadius: 14,
                  padding: "16px 20px",
                  color: "#15803d",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  💰 Total Paid Amount
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  ₹{cumulativeTotalPaid.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                  Across {paidOrdersCount} paid order{paidOrdersCount !== 1 ? "s" : ""}
                </div>
              </div>

              <div
                style={{
                  background: "#fee2e2",
                  border: "1.5px solid #ef4444",
                  borderRadius: 14,
                  padding: "16px 20px",
                  color: "#991b1b",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  ⏳ Total Non-Paid Amount
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>
                  ₹{cumulativeTotalNonPaid.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                  Across {nonPaidOrdersCount} non-paid order{nonPaidOrdersCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>

            {/* ADD MANUAL ORDER FORM */}
            <div className="admin-form-header" onClick={() => setExpandOrderForm(!expandOrderForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span>{expandOrderForm ? "➖ HIDE ADD ORDER FORM" : "➕ ADD MANUAL ORDER"}</span>
              <span>{expandOrderForm ? "▲" : "▼"}</span>
            </div>

            {expandOrderForm && (
              <form className="admin-form-body" onSubmit={handleAddOrder}>
                <div className="sale-form">
                  <div className="form-field">
                    <label className="form-label">Order ID (Starts with 'O')</label>
                    <input
                      className="form-input"
                      placeholder="e.g. O-1001 (Leave blank to auto-generate)"
                      value={newOrder.id}
                      onChange={(e) => setNewOrder({ ...newOrder, id: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Customer ID / Email *</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="customer@example.com"
                      value={newOrder.customerId}
                      onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Payment Status *</label>
                    <select
                      className="form-input"
                      value={newOrder.status}
                      onChange={(e) => setNewOrder({ ...newOrder, status: e.target.value })}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Not Paid">Not Paid</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Order Status *</label>
                    <select
                      className="form-input"
                      value={newOrder.orderStatus}
                      onChange={(e) => setNewOrder({ ...newOrder, orderStatus: e.target.value })}
                    >
                      <option value="Order Received">Order Received</option>
                      <option value="In progress">In progress</option>
                      <option value="In transient">In transient</option>
                      <option value="customer received">customer received</option>
                      <option value="Return">Return</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="admin-action-btn" style={{ background: "#1a1714", color: "#fff", padding: "12px 24px", marginTop: 14 }}>
                  Create Order Entry
                </button>
              </form>
            )}

            {/* ORDERS MANAGEMENT CONTAINER */}
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <div className="admin-card-title" style={{ margin: 0 }}>
                  Orders Directory ({orders.length} orders)
                </div>

                {/* FILTER BY ORDER ID */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "var(--text2)" }}>Filter Order ID:</label>
                  <input
                    className="form-input"
                    style={{ padding: "6px 12px", fontSize: 12, width: 180 }}
                    placeholder="Search e.g. O-1001"
                    value={orderIdFilter}
                    onChange={(e) => setOrderIdFilter(e.target.value)}
                  />
                  {orderIdFilter && (
                    <button
                      type="button"
                      onClick={() => setOrderIdFilter("")}
                      style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg2)", fontSize: 11, cursor: "pointer" }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {orders.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text2)", fontSize: 14 }}>
                  No orders recorded yet. Click "ADD MANUAL ORDER" above to create your first order entry.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {orders
                    .filter((o) => o.id.toLowerCase().includes(orderIdFilter.toLowerCase().trim()))
                    .map((ord) => {
                      const itemsList = ord.items || [];
                      const itemsSubtotal = itemsList.reduce((sum, item) => sum + (item.subtotal || item.quantity * item.unitPrice), 0);
                      const shippingFee = ord.shippingFee || 0;

                      return (
                        <div
                          key={ord.id}
                          style={{
                            border: "1.5px solid var(--border)",
                            borderRadius: 12,
                            background: "var(--bg)",
                            overflow: "hidden",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          {/* MASTER VIEW HEADER */}
                          <div
                            style={{
                              background: "var(--bg2)",
                              padding: "14px 18px",
                              borderBottom: "1.5px solid var(--border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: 12,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 800, fontSize: 15, color: "var(--accent)" }}>
                                📦 {ord.id}
                              </span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                                👤 {ord.customerId}
                              </span>
                              <span style={{ fontSize: 12, color: "var(--text2)" }}>
                                📅 {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-IN") : "Today"}
                              </span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                              {/* PAYMENT STATUS DROPDOWN */}
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>PAYMENT:</span>
                                <select
                                  value={ord.status}
                                  onChange={(e) => handleUpdateOrder(ord.id, { status: e.target.value })}
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 6,
                                    border: ord.status === "Paid" ? "1.5px solid #16a34a" : "1.5px solid #dc2626",
                                    background: ord.status === "Paid" ? "#dcfce7" : "#fee2e2",
                                    color: ord.status === "Paid" ? "#15803d" : "#991b1b",
                                    fontWeight: 700,
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="Paid">Paid</option>
                                  <option value="Not Paid">Not Paid</option>
                                </select>
                              </div>

                              {/* ORDER STATUS DROPDOWN */}
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)" }}>STATUS:</span>
                                <select
                                  value={ord.orderStatus || "Order Received"}
                                  onChange={(e) => handleUpdateOrder(ord.id, { orderStatus: e.target.value })}
                                  style={{
                                    padding: "5px 10px",
                                    borderRadius: 6,
                                    border: "1px solid var(--border)",
                                    background: "var(--bg)",
                                    color: "var(--text)",
                                    fontWeight: 600,
                                    fontSize: 12,
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="Order Received">Order Received</option>
                                  <option value="In progress">In progress</option>
                                  <option value="In transient">In transient</option>
                                  <option value="customer received">customer received</option>
                                  <option value="Return">Return</option>
                                </select>
                              </div>

                              <button
                                className="admin-del-btn"
                                onClick={() => handleRemoveOrder(ord.id)}
                                title="Delete Order"
                                style={{ padding: "6px 10px" }}
                              >
                                <Icon.Trash />
                              </button>
                            </div>
                          </div>

                          {/* ITEM GRID (SUB-TABLE) */}
                          <div style={{ padding: "12px 18px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", color: "var(--text2)" }}>
                                🛒 Order Items Grid ({itemsList.length} products)
                              </div>
                            </div>

                            {itemsList.length === 0 ? (
                              <div style={{ fontSize: 13, color: "var(--text2)", fontStyle: "italic", padding: "8px 0" }}>
                                No product rows attached to this order. Use the form below to add products to this order.
                              </div>
                            ) : (
                              <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                  <thead>
                                    <tr style={{ background: "var(--bg2)", borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Item ID (PK)</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Product Name</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Size</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Quantity</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700 }}>Unit Price</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700, textAlign: "right" }}>Total Price</th>
                                      <th style={{ padding: "8px 12px", fontWeight: 700, textAlign: "right" }}>Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {itemsList.map((it, idx) => {
                                      const itemIdFormatted = it.itemId || `${ord.id}_${it.productId}_${it.quantity}`;
                                      const subtotalVal = it.subtotal || it.quantity * it.unitPrice;

                                      return (
                                        <tr key={idx} style={{ borderBottom: "1px solid var(--border)" }}>
                                          <td style={{ padding: "8px 12px", fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>
                                            {itemIdFormatted}
                                          </td>
                                          <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                                            {it.isKids ? "🎈 " : "🛍️ "}{it.productName}
                                          </td>
                                          <td style={{ padding: "8px 12px" }}>
                                            <span style={{ background: "var(--bg2)", border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 4, fontWeight: 700, fontSize: 11 }}>
                                              {it.size}
                                            </span>
                                          </td>
                                          <td style={{ padding: "8px 12px", fontWeight: 700 }}>{it.quantity}</td>
                                          <td style={{ padding: "8px 12px" }}>₹{it.unitPrice}</td>
                                          <td style={{ padding: "8px 12px", fontWeight: 700, color: "var(--accent)", textAlign: "right" }}>
                                            ₹{subtotalVal}
                                          </td>
                                          <td style={{ padding: "8px 12px", textAlign: "right" }}>
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveOrderItem(ord.id, itemIdFormatted)}
                                              title="Delete Order Line Item"
                                              style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 14 }}
                                            >
                                              <Icon.Trash />
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* INLINE ADD PRODUCT ITEM BAR */}
                            {(() => {
                              const currentProdKey = orderSelectedProduct[ord.id] || (products[0] ? `adult_${products[0].id}` : kidsProducts[0] ? `kids_${kidsProducts[0].id}` : "");
                              const [curType, curIdStr] = currentProdKey.split("_");
                              const curId = parseInt(curIdStr || "0");

                              let availableSizesForSel: string[] = [];
                              if (curType === "adult") {
                                const selP = products.find((x) => x.id === curId);
                                if (selP) availableSizesForSel = getAvailableSizes(selP, false);
                              } else if (curType === "kids") {
                                const selKP = kidsProducts.find((x) => x.id === curId);
                                if (selKP) availableSizesForSel = getAvailableSizes(selKP, true);
                              }

                              return (
                                <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", color: "var(--text)" }}>
                                    Add Product to Order:
                                  </span>
                                  <select
                                    id={`add_prod_${ord.id}`}
                                    value={currentProdKey}
                                    onChange={(e) => setOrderSelectedProduct((prev) => ({ ...prev, [ord.id]: e.target.value }))}
                                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, fontWeight: 600, background: "var(--bg)", color: "var(--text)" }}
                                  >
                                    <optgroup label="Adult Streetwear T-Shirts">
                                      {products.map((p) => {
                                        const sp = getSalePrice(p, sale, false);
                                        const priceStr = sp !== null ? `₹${sp} (Sale! Was ₹${p.basePrice})` : `₹${p.basePrice}`;
                                        return (
                                          <option key={`adult_${p.id}`} value={`adult_${p.id}`}>
                                            [Adult #{p.id}] {p.name} — {priceStr} (Qty: {p.qty})
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                    <optgroup label="Kids Products">
                                      {kidsProducts.map((kp) => {
                                        const sp = getSalePrice(kp, sale, true);
                                        const priceStr = sp !== null ? `₹${sp} (Sale! Was ₹${kp.basePrice})` : `₹${kp.basePrice}`;
                                        return (
                                          <option key={`kids_${kp.id}`} value={`kids_${kp.id}`}>
                                            [Kids #{kp.id}] {kp.name} — {priceStr} (Qty: {kp.qty})
                                          </option>
                                        );
                                      })}
                                    </optgroup>
                                  </select>

                                  <select
                                    id={`add_size_${ord.id}`}
                                    disabled={availableSizesForSel.length === 0}
                                    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, background: "var(--bg)", color: "var(--text)" }}
                                  >
                                    {availableSizesForSel.length === 0 ? (
                                      <option value="">Out of Stock (0 qty)</option>
                                    ) : (
                                      availableSizesForSel.map((sz) => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))
                                    )}
                                  </select>

                                  <input
                                    id={`add_qty_${ord.id}`}
                                    type="number"
                                    min="1"
                                    defaultValue="1"
                                    disabled={availableSizesForSel.length === 0}
                                    style={{ width: 60, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 12, fontWeight: 600, background: "var(--bg)", color: "var(--text)" }}
                                  />

                                  <button
                                    type="button"
                                    disabled={availableSizesForSel.length === 0}
                                    onClick={() => {
                                      const prodEl = document.getElementById(`add_prod_${ord.id}`) as HTMLSelectElement;
                                      const sizeEl = document.getElementById(`add_size_${ord.id}`) as HTMLSelectElement;
                                      const qtyEl = document.getElementById(`add_qty_${ord.id}`) as HTMLInputElement;
                                      if (prodEl && sizeEl && qtyEl && sizeEl.value) {
                                        handleAddItemToOrder(ord.id, prodEl.value, sizeEl.value, parseInt(qtyEl.value) || 1);
                                      }
                                    }}
                                    style={{
                                      padding: "6px 14px",
                                      borderRadius: 6,
                                      border: "none",
                                      background: availableSizesForSel.length === 0 ? "#6b7280" : "var(--accent)",
                                      color: "#ffffff",
                                      fontWeight: 700,
                                      fontSize: 12,
                                      cursor: availableSizesForSel.length === 0 ? "not-allowed" : "pointer",
                                    }}
                                  >
                                    Add Item
                                  </button>
                                </div>
                              );
                            })()}
                          </div>

                          {/* SUMMARY FOOTER */}
                          <div
                            style={{
                              background: "var(--bg2)",
                              padding: "10px 18px",
                              borderTop: "1px solid var(--border)",
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: 20,
                              fontSize: 13,
                            }}
                          >
                            <div>
                              <span style={{ color: "var(--text2)" }}>Items Subtotal: </span>
                              <span style={{ fontWeight: 600 }}>₹{itemsSubtotal}</span>
                            </div>
                            <div style={{ background: "var(--accent)", color: "#ffffff", padding: "4px 12px", borderRadius: 8, fontWeight: 800, fontSize: 14 }}>
                              Grand Total: ₹{ord.totalAmount}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </div>
  );
}
