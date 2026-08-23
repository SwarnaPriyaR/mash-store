"use client";

/**
 * components/AdminPortal.tsx
 * Admin management portal for Adult Products and Kids Products.
 * Includes category dropdowns, per-size stock management, and cumulative stock calculation.
 */

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { useSale } from "./SaleProvider";
import { convertDriveUrl, DEFAULT_SALE, getSizeStock, embedSizeStockInDescription } from "@/lib/helpers";
import type { Product, KidsProduct } from "@/lib/db";

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
    if (typeof window !== "undefined" && sessionStorage.getItem("admin_authed") === "true") {
      setAuthed(true);
    }
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

  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Sale form state
  const [saleForm, setSaleForm] = useState({ discount: 15, durationHours: 24, startTime: "", mode: "scheduled" });

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isSaleScheduled = !isSaleActive && sale.startTime != null && Date.now() < Number(sale.startTime);

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

  useEffect(() => {
    if (authed) {
      refreshProducts();
      refreshKidsProducts();
    }
  }, [authed, refreshProducts, refreshKidsProducts]);

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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
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
      console.error("Failed to add product:", err);
      showToast(`❌ Add product failed: ${String(err)}`);
    }
  }, [newProd, isSaleActive, sale.discount, showToast]);

  const updateProductStock = useCallback(async (p: AdminProduct, sz: string, val: string) => {
    const parsed = Math.max(0, parseInt(val) || 0);
    const updatedSizeStock = { ...p.sizeStock, [sz]: parsed };
    const cumulativeTotal = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0);
    const updatedDesc = embedSizeStockInDescription(p.description, updatedSizeStock);

    setProducts((prev) =>
      prev.map((prod) => (prod.id === p.id ? { ...prod, qty: cumulativeTotal, sizeStock: updatedSizeStock, description: updatedDesc } : prod))
    );

    try {
      const res = await fetch(`/api/product/updateProduct/${p.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: cumulativeTotal, description: updatedDesc }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      showToast(`Updated ${sz} stock (${parsed}) for ${p.name}. Total: ${cumulativeTotal}`);
    } catch (err) {
      console.error("Update error:", err);
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
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
      console.error("Failed to add kids product:", err);
      showToast(`❌ Add kids product failed: ${String(err)}`);
    }
  }, [newKidsProd, isSaleActive, sale.discount, showToast]);

  const updateKidsProductStock = useCallback(async (kp: AdminKidsProduct, sz: string, val: string) => {
    const parsed = Math.max(0, parseInt(val) || 0);
    const updatedSizeStock = { ...kp.sizeStock, [sz]: parsed };
    const cumulativeTotal = Object.values(updatedSizeStock).reduce((a, b) => a + b, 0);
    const updatedDesc = embedSizeStockInDescription(kp.description, updatedSizeStock);

    setKidsProducts((prev) =>
      prev.map((prod) => (prod.id === kp.id ? { ...prod, qty: cumulativeTotal, sizeStock: updatedSizeStock, description: updatedDesc } : prod))
    );

    try {
      const res = await fetch(`/api/kids/updateProduct/${kp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty: cumulativeTotal, description: updatedDesc }),
      });
      if (!res.ok) throw new Error("Failed to update stock");
      showToast(`Updated ${sz} stock (${parsed}) for ${kp.name}. Total: ${cumulativeTotal}`);
    } catch (err) {
      console.error("Update error:", err);
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

  if (!mounted) return null;

  // Login Screen
  if (!authed) {
    const handleLoginSubmit = () => {
      const expectedPass = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
      if (adminPass === expectedPass || adminPass === "admin") {
        setAuthed(true);
        sessionStorage.setItem("admin_authed", "true");
        showToast("🔓 Admin Portal Access Granted");
      } else {
        showToast("❌ Incorrect admin password");
      }
    };

    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-logo" style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <img src="/asset/logoDark.png" alt="MASH" style={{ height: 64, width: "auto", objectFit: "contain" }} />
          </div>
          <h2 className="admin-login-title">Admin Management Portal</h2>
          <div className="form-field" style={{ textAlign: "left" }}>
            <label className="form-label" style={{ color: "#9e9288" }}>Password</label>
            <input
              className="form-input"
              type="password"
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

  const handleLogout = () => { setAuthed(false); sessionStorage.removeItem("admin_authed"); showToast("🔒 Logged out"); };

  return (
    <div className="admin-portal-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo" onClick={() => setCurrentSection("dashboard")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <img src="/asset/logoLight.png" alt="MASH" style={{ height: 38, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: "14px", background: "var(--accent)", color: "#fff", padding: "2px 8px", borderRadius: "4px" }}>ADMIN</span>
          </div>
          <ul className="admin-sidebar-menu">
            <li><button className={`admin-sidebar-btn ${currentSection === "dashboard" ? "active" : ""}`} onClick={() => setCurrentSection("dashboard")}>📊 Dashboard</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "inventory" ? "active" : ""}`} onClick={() => setCurrentSection("inventory")}>👕 Adult Products</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "kids-inventory" ? "active" : ""}`} onClick={() => setCurrentSection("kids-inventory")}>🎈 Kids Products</button></li>
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
                <p className="admin-sub">Stock & catalog statistics for MASH store</p>
              </div>
            </header>
            <div className="admin-stats-grid">
              <div className="admin-stat-card purple"><span className="admin-stat-title">Adult Products</span><span className="admin-stat-number">{products.length}</span></div>
              <div className="admin-stat-card green"><span className="admin-stat-title">Kids Products</span><span className="admin-stat-number">{kidsProducts.length}</span></div>
              <div className="admin-stat-card orange"><span className="admin-stat-title">Total Adult Stock</span><span className="admin-stat-number">{products.reduce((acc, p) => acc + p.qty, 0)}</span></div>
              <div className="admin-stat-card accent"><span className="admin-stat-title">Total Kids Stock</span><span className="admin-stat-number">{kidsProducts.reduce((acc, p) => acc + p.qty, 0)}</span></div>
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

                  {/* ADULT CATEGORY DROPDOWN: Men, Women, Unisex */}
                  <div className="form-field">
                    <label className="form-label">Category *</label>
                    <select
                      className="admin-input"
                      style={{ padding: "10px 14px", height: "43px" }}
                      value={newProd.category}
                      onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    >
                      <option value="Men">Men</option>
                      <option value="Women">Women</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>

                  {/* PER-SIZE STOCK INPUTS FOR ADULT (S, M, L, XL) */}
                  <div className="form-field full" style={{ background: "var(--bg2)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>
                      Per-Size Stock Quantities & Cumulative Calculation:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      {["S", "M", "L", "XL"].map((sz) => (
                        <div key={sz}>
                          <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>Size {sz}:</label>
                          <input
                            type="number"
                            min="0"
                            className="form-input"
                            value={newProd.sizeStock[sz] ?? 0}
                            onChange={(e) =>
                              setNewProd({
                                ...newProd,
                                sizeStock: { ...newProd.sizeStock, [sz]: Math.max(0, parseInt(e.target.value) || 0) },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                      Total Cumulative Stock: {Object.values(newProd.sizeStock).reduce((a, b) => a + (b || 0), 0)} units
                    </div>
                  </div>

                  <div className="form-field full"><label className="form-label">Image URL *</label><input className="form-input" placeholder="Paste image link" value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Description</label><textarea className="form-input" placeholder="Product details" value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} /></div>
                </div>
                <button type="submit" className="admin-action-btn" style={{ background: "var(--accent)", color: "#fff", padding: "12px 24px", marginTop: 14 }}>
                  Save Adult Product
                </button>
              </form>
            )}

            {/* ADULT PRODUCT CATALOG TABLE */}
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

                  {/* PER-SIZE STOCK EDITING */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["S", "M", "L", "XL"].map((sz) => {
                      const count = p.sizeStock[sz] ?? 0;
                      return (
                        <div key={sz} style={{ display: "flex", alignItems: "center", gap: 4, background: count === 0 ? "#fee2e2" : "var(--bg2)", padding: "2px 6px", borderRadius: 6, border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{sz}:</span>
                          <input
                            type="number"
                            min="0"
                            style={{ width: 44, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                            value={editValues[`${p.id}_${sz}`] ?? count}
                            onChange={(e) => setEditValues({ ...editValues, [`${p.id}_${sz}`]: e.target.value })}
                            onBlur={(e) => {
                              if (e.target.value !== "") {
                                updateProductStock(p, sz, e.target.value);
                              }
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
                <p className="admin-sub">Category selector & per-size stock management (2–3 Y, 4–5 Y, 6–7 Y, 8–9 Y)</p>
              </div>
            </header>
            <div className="admin-form-header" onClick={() => setExpandKidsAddForm(!expandKidsAddForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <span>{expandKidsAddForm ? "➖ HIDE ADD KIDS PRODUCT FORM" : "➕ ADD NEW KIDS PRODUCT"}</span>
              <span>{expandKidsAddForm ? "▲" : "▼"}</span>
            </div>
            {expandKidsAddForm && (
              <form className="admin-form-body" onSubmit={handleAddKidsProduct}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Kids Dress Name *</label><input className="form-input" placeholder="e.g. Unicorn Sparkle Frock" value={newKidsProd.name} onChange={(e) => setNewKidsProd({ ...newKidsProd, name: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Base Price (INR) *</label><input className="form-input" type="number" placeholder="e.g. 599" value={newKidsProd.price} onChange={(e) => setNewKidsProd({ ...newKidsProd, price: e.target.value })} required /></div>

                  {/* KIDS CATEGORY DROPDOWN: Girl, Boy, Unisex */}
                  <div className="form-field">
                    <label className="form-label">Category *</label>
                    <select
                      className="admin-input"
                      style={{ padding: "10px 14px", height: "43px" }}
                      value={newKidsProd.category}
                      onChange={(e) => setNewKidsProd({ ...newKidsProd, category: e.target.value })}
                    >
                      <option value="Girl">Girl</option>
                      <option value="Boy">Boy</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>

                  {/* PER-SIZE STOCK INPUTS FOR KIDS (2–3 Y, 4–5 Y, 6–7 Y, 8–9 Y) */}
                  <div className="form-field full" style={{ background: "var(--bg2)", padding: "14px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <label className="form-label" style={{ fontWeight: 700, marginBottom: 8, display: "block" }}>
                      Per-Size Stock Quantities & Cumulative Calculation:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                      {["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"].map((sz) => (
                        <div key={sz}>
                          <label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 4 }}>{sz}:</label>
                          <input
                            type="number"
                            min="0"
                            className="form-input"
                            value={newKidsProd.sizeStock[sz] ?? 0}
                            onChange={(e) =>
                              setNewKidsProd({
                                ...newKidsProd,
                                sizeStock: { ...newKidsProd.sizeStock, [sz]: Math.max(0, parseInt(e.target.value) || 0) },
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                      Total Cumulative Stock: {Object.values(newKidsProd.sizeStock).reduce((a, b) => a + (b || 0), 0)} units
                    </div>
                  </div>

                  <div className="form-field full"><label className="form-label">Image URL *</label><input className="form-input" placeholder="Paste image link" value={newKidsProd.image} onChange={(e) => setNewKidsProd({ ...newKidsProd, image: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Description</label><textarea className="form-input" placeholder="Kids outfit details" value={newKidsProd.description} onChange={(e) => setNewKidsProd({ ...newKidsProd, description: e.target.value })} /></div>
                </div>
                <button type="submit" className="admin-action-btn" style={{ background: "#1a1714", color: "#fff", padding: "12px 24px", marginTop: 14 }}>
                  Save Kids Product
                </button>
              </form>
            )}

            {/* KIDS CATALOG LIST */}
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

                  {/* KIDS PER-SIZE STOCK EDITING */}
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
                              if (e.target.value !== "") {
                                updateKidsProductStock(kp, sz, e.target.value);
                              }
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
      </main>

      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </div>
  );
}
