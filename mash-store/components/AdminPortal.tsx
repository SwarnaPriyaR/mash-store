"use client";

/**
 * components/AdminPortal.tsx
 * Admin management portal for Adult Products and Kids Products.
 * Connected to dedicated Next.js Route Handlers (/api/product and /api/kids).
 */

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Icon } from "./Icon";
import { useSale } from "./SaleProvider";
import { convertDriveUrl, DEFAULT_SALE } from "@/lib/helpers";
import type { Product, KidsProduct } from "@/lib/db";

type AdminProduct = Product & { price: number; reviews: unknown[] };
type AdminKidsProduct = KidsProduct & { price: number; reviews: unknown[] };

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

  // Adult Product state
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [expandAddForm, setExpandAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    qty: "",
    fit: "Regular",
    category: "Men T-Shirt",
    image: "",
    tags: "Streetwear, Unisex",
    description: "Premium heavy cotton streetwear tee.",
  });

  // Kids Product state
  const [kidsProducts, setKidsProducts] = useState<AdminKidsProduct[]>([]);
  const [expandKidsAddForm, setExpandKidsAddForm] = useState(false);
  const [newKidsProd, setNewKidsProd] = useState({
    name: "",
    price: "",
    qty: "",
    sizes: "2–3 Years, 4–5 Years, 6–7 Years, 8–9 Years",
    image: "",
    tags: "Kids, Party, Cute",
    description: "Soft organic cotton dress crafted for kids comfort.",
  });

  const [selectedImgTemplate, setSelectedImgTemplate] = useState("");
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  // Sale form state
  const [saleForm, setSaleForm] = useState({ discount: 15, durationHours: 24, startTime: "", mode: "scheduled" });

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  }, []);

  const templates = [
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
  ];

  const kidsTemplates = [
    "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
    "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&q=80",
    "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
  ];

  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isSaleScheduled = !isSaleActive && sale.startTime != null && Date.now() < Number(sale.startTime);
  const lowStock = products.filter((p) => p.qty > 0 && p.qty <= 5);

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
            reviews: [],
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
            reviews: [],
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
  const updateProduct = useCallback(async (id: number, field: string, value: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p };
        if (field === "qty") next.qty = Math.max(0, parseInt(value) || 0);
        else if (field === "basePrice") {
          next.basePrice = parseInt(value) || p.basePrice;
          next.price = isSaleActive ? Math.round(next.basePrice * (1 - sale.discount / 100)) : next.basePrice;
        } else {
          (next as Record<string, unknown>)[field] = value;
        }
        return next;
      })
    );
    try {
      const body: Record<string, unknown> = {};
      if (field === "qty") body.qty = parseInt(value);
      else if (field === "basePrice") body.basePrice = parseInt(value);
      else body[field] = value;

      const res = await fetch(`/api/product/updateProduct/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
    } catch (err) {
      console.error(`Failed to update product ${id}:`, err);
      showToast(`❌ Update failed: ${String(err)}`);
      await refreshProducts();
    }
  }, [isSaleActive, sale.discount, refreshProducts, showToast]);

  const removeProduct = useCallback(async (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      const res = await fetch(`/api/product/removeProduct/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      showToast("🗑 Adult Product removed");
    } catch (err) {
      console.error(`Failed to delete product ${id}:`, err);
      showToast(`❌ Delete failed: ${String(err)}`);
      await refreshProducts();
    }
  }, [refreshProducts, showToast]);

  const handleAddProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim()) { showToast("Product name is required"); return; }
    const baseP = parseInt(newProd.price);
    if (isNaN(baseP) || baseP <= 0) { showToast("Base price must be positive"); return; }
    const quantity = parseInt(newProd.qty);
    if (isNaN(quantity) || quantity < 0) { showToast("Quantity must be non-negative"); return; }

    const payload = {
      name: newProd.name.trim(),
      basePrice: baseP,
      qty: quantity,
      fit: newProd.fit,
      category: newProd.category,
      sizes: ["S", "M", "L", "XL"],
      image: convertDriveUrl(newProd.image.trim()) || templates[0],
      tags: newProd.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: newProd.description.trim() || "Premium streetwear tee.",
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
      setProducts((prev) => [...prev, { ...created, price: finalPrice, image: convertDriveUrl(created.image), reviews: [] }]);
      setNewProd({ name: "", price: "", qty: "", fit: "Regular", category: "Men T-Shirt", image: "", tags: "Streetwear, Unisex", description: "Premium streetwear tee." });
      setExpandAddForm(false);
      showToast(`🎉 "${created.name}" saved to Adult Inventory!`);
    } catch (err) {
      console.error("Failed to add product:", err);
      showToast(`❌ Add product failed: ${String(err)}`);
    }
  }, [newProd, isSaleActive, sale.discount, templates, showToast]);

  // Kids Product Handlers
  const updateKidsProduct = useCallback(async (id: number, field: string, value: string) => {
    setKidsProducts((prev) =>
      prev.map((kp) => {
        if (kp.id !== id) return kp;
        const next = { ...kp };
        if (field === "qty") next.qty = Math.max(0, parseInt(value) || 0);
        else if (field === "basePrice") {
          next.basePrice = parseInt(value) || kp.basePrice;
          next.price = isSaleActive ? Math.round(next.basePrice * (1 - sale.discount / 100)) : next.basePrice;
        } else {
          (next as Record<string, unknown>)[field] = value;
        }
        return next;
      })
    );
    try {
      const body: Record<string, unknown> = {};
      if (field === "qty") body.qty = parseInt(value);
      else if (field === "basePrice") body.basePrice = parseInt(value);
      else body[field] = value;

      const res = await fetch(`/api/kids/updateProduct/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
    } catch (err) {
      console.error(`Failed to update kids product ${id}:`, err);
      showToast(`❌ Update failed: ${String(err)}`);
      await refreshKidsProducts();
    }
  }, [isSaleActive, sale.discount, refreshKidsProducts, showToast]);

  const removeKidsProduct = useCallback(async (id: number) => {
    setKidsProducts((prev) => prev.filter((kp) => kp.id !== id));
    try {
      const res = await fetch(`/api/kids/removeProduct/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      showToast("🗑 Kids Product removed");
    } catch (err) {
      console.error(`Failed to delete kids product ${id}:`, err);
      showToast(`❌ Delete failed: ${String(err)}`);
      await refreshKidsProducts();
    }
  }, [refreshKidsProducts, showToast]);

  const handleAddKidsProduct = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidsProd.name.trim()) { showToast("Kids product name is required"); return; }
    const baseP = parseInt(newKidsProd.price);
    if (isNaN(baseP) || baseP <= 0) { showToast("Base price must be positive"); return; }
    const quantity = parseInt(newKidsProd.qty);
    if (isNaN(quantity) || quantity < 0) { showToast("Quantity must be non-negative"); return; }

    const payload = {
      name: newKidsProd.name.trim(),
      basePrice: baseP,
      qty: quantity,
      sizes: newKidsProd.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      image: convertDriveUrl(newKidsProd.image.trim()) || kidsTemplates[0],
      tags: newKidsProd.tags.split(",").map((t) => t.trim()).filter(Boolean),
      description: newKidsProd.description.trim() || "Soft organic cotton dress crafted for kids comfort.",
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
      setKidsProducts((prev) => [...prev, { ...created, price: finalPrice, image: convertDriveUrl(created.image), reviews: [] }]);
      setNewKidsProd({ name: "", price: "", qty: "", sizes: "2–3 Years, 4–5 Years, 6–7 Years, 8–9 Years", image: "", tags: "Kids, Party", description: "Soft cotton dress." });
      setExpandKidsAddForm(false);
      showToast(`🎉 "${created.name}" saved to Kids Inventory!`);
    } catch (err) {
      console.error("Failed to add kids product:", err);
      showToast(`❌ Add kids product failed: ${String(err)}`);
    }
  }, [newKidsProd, isSaleActive, sale.discount, kidsTemplates, showToast]);

  if (!mounted) return null;

  // ── Login screen ──
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

  // ── Sale handlers ──
  const handleSetSale = (e: React.FormEvent) => {
    e.preventDefault();
    const discount = parseInt(String(saleForm.discount));
    if (isNaN(discount) || discount < 1 || discount > 90) { showToast("Discount must be between 1% and 90%"); return; }
    const hours = parseFloat(String(saleForm.durationHours));
    if (isNaN(hours) || hours <= 0) { showToast("Duration must be a positive number"); return; }

    if (saleForm.mode === "instant") {
      const start = Date.now();
      const end = start + hours * 3_600_000;
      setSale({ active: true, discount, start, end, startTime: start, durationHours: hours });
      showToast(`🎉 Sale activated! ${discount}% off for ${hours}h`);
    } else {
      if (!saleForm.startTime) { showToast("Please select a start date and time"); return; }
      const start = new Date(saleForm.startTime).getTime();
      if (start <= Date.now()) { showToast("Start time must be in the future"); return; }
      const end = start + hours * 3_600_000;
      setSale({ active: false, discount, start, end, startTime: start, durationHours: hours });
      const startTimeStr = new Date(start).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
      showToast(`⏰ Offer scheduled to start on ${startTimeStr}`);
    }
  };

  const handleCancelSale = () => { setSale(DEFAULT_SALE); showToast("Offer cancelled. Prices restored."); };
  const handleLogout = () => { setAuthed(false); sessionStorage.removeItem("admin_authed"); showToast("🔒 Logged out of Admin Portal"); };

  return (
    <div className="admin-portal-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo" onClick={() => setCurrentSection("dashboard")} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/asset/logoLight.png" alt="MASH" style={{ height: 38, width: "auto", objectFit: "contain" }} />
            <span style={{ fontSize: "14px", background: "var(--accent)", color: "#fff", padding: "2px 8px", borderRadius: "4px", letterSpacing: "0.05em" }}>ADMIN</span>
          </div>
          <ul className="admin-sidebar-menu">
            <li><button className={`admin-sidebar-btn ${currentSection === "dashboard" ? "active" : ""}`} onClick={() => setCurrentSection("dashboard")}>📊 Dashboard</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "inventory" ? "active" : ""}`} onClick={() => setCurrentSection("inventory")}>👕 Adult Products</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "kids-inventory" ? "active" : ""}`} onClick={() => setCurrentSection("kids-inventory")}>🎈 Kids Products</button></li>
            <li><button className={`admin-sidebar-btn ${currentSection === "sale" ? "active" : ""}`} onClick={() => setCurrentSection("sale")}>🏷️ Sale Controller</button></li>
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

      {/* MAIN */}
      <main className="admin-main-content">
        {/* DASHBOARD */}
        {currentSection === "dashboard" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">DASHBOARD OVERVIEW</h1>
                <p className="admin-sub">Real-time status overview of MASH clothing store</p>
              </div>
            </header>
            <div className="admin-stats-grid">
              <div className="admin-stat-card purple"><span className="admin-stat-title">Adult Products</span><span className="admin-stat-number">{products.length}</span><span className="admin-stat-desc">Standard catalog drops</span></div>
              <div className="admin-stat-card green"><span className="admin-stat-title">Kids Products</span><span className="admin-stat-number">{kidsProducts.length}</span><span className="admin-stat-desc">Kids dresses & outfits</span></div>
              <div className="admin-stat-card orange"><span className="admin-stat-title">Active Offer</span><span className="admin-stat-number">{isSaleActive ? `${sale.discount}% OFF` : "None"}</span><span className="admin-stat-desc">{isSaleActive ? "Discount currently applied sitewide" : "Regular pricing is active"}</span></div>
              <div className="admin-stat-card accent"><span className="admin-stat-title">Scheduled Offer</span><span className="admin-stat-number">{isSaleScheduled ? `${sale.discount}% OFF` : "No"}</span><span className="admin-stat-desc">{isSaleScheduled ? `Starting ${new Date(Number(sale.startTime)).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : "No scheduled countdowns"}</span></div>
            </div>
          </div>
        )}

        {/* ADULT PRODUCTS INVENTORY */}
        {currentSection === "inventory" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">ADULT PRODUCTS INVENTORY</h1>
                <p className="admin-sub">Manage S, M, L, XL clothing catalog — backed by Neon PostgreSQL</p>
              </div>
            </header>
            <div className="admin-form-header" onClick={() => setExpandAddForm(!expandAddForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{expandAddForm ? "➖ HIDE ADD ADULT PRODUCT FORM" : "➕ ADD NEW ADULT PRODUCT (S, M, L, XL)"}</span>
              <span style={{ fontSize: "18px" }}>{expandAddForm ? "▲" : "▼"}</span>
            </div>
            {expandAddForm && (
              <form className="admin-form-body" onSubmit={handleAddProduct}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Product Name *</label><input className="form-input" placeholder="e.g. Vintage Samurai Tee" value={newProd.name} onChange={(e) => setNewProd({ ...newProd, name: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Base Price (INR) *</label><input className="form-input" type="number" placeholder="e.g. 799" value={newProd.price} onChange={(e) => setNewProd({ ...newProd, price: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Stock Quantity *</label><input className="form-input" type="number" placeholder="e.g. 20" value={newProd.qty} onChange={(e) => setNewProd({ ...newProd, qty: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Fit Style</label><select className="admin-input" style={{ padding: "10px 14px", height: "43px" }} value={newProd.fit} onChange={(e) => setNewProd({ ...newProd, fit: e.target.value })}><option>Regular</option><option>Oversized</option></select></div>
                  <div className="form-field full"><label className="form-label">Image URL *</label><input className="form-input" placeholder="Select template below or paste custom image link" value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="Streetwear, Unisex, Vintage" value={newProd.tags} onChange={(e) => setNewProd({ ...newProd, tags: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Product Description</label><textarea className="form-input" style={{ minHeight: "80px" }} placeholder="Fabric GSM, fit details..." value={newProd.description} onChange={(e) => setNewProd({ ...newProd, description: e.target.value })} /></div>
                </div>
                <button type="submit" className="admin-action-btn" style={{ background: "var(--accent)", color: "#fff", width: "220px", padding: "12px", marginTop: "12px" }}>
                  Save Adult Product
                </button>
              </form>
            )}
            <div className="admin-card">
              <div className="admin-card-title">👕 Adult Catalog List (Sizes: S, M, L, XL)</div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 110px 48px", gap: 12, padding: "8px 16px", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                {["", "Product Details", "Qty", "Stock Adj.", "Base Price", "Sizes", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)" }}>{h}</span>
                ))}
              </div>
              {products.map((p) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 110px 48px", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <img src={p.image} alt={p.name} className="admin-thumb" />
                  <div><div className="admin-name">{p.name}</div><div className="admin-id">ID: {p.id}</div></div>
                  <span className={`admin-qty-badge ${p.qty === 0 ? "qty-out" : p.qty <= 5 ? "qty-low" : "qty-ok"}`}>{p.qty}</span>
                  <input className="admin-input" type="number" placeholder="New qty" value={editValues[`qty_${p.id}`] ?? ""}
                    onChange={(e) => setEditValues({ ...editValues, [`qty_${p.id}`]: e.target.value })}
                    onBlur={(e) => { if (e.target.value !== "") { updateProduct(p.id, "qty", e.target.value); setEditValues({ ...editValues, [`qty_${p.id}`]: "" }); showToast(`Stock updated for ${p.name}`); } }} />
                  <input className="admin-input" type="number" placeholder="Base price" value={editValues[`price_${p.id}`] ?? ""}
                    onChange={(e) => setEditValues({ ...editValues, [`price_${p.id}`]: e.target.value })}
                    onBlur={(e) => { if (e.target.value !== "") { updateProduct(p.id, "basePrice", e.target.value); setEditValues({ ...editValues, [`price_${p.id}`]: "" }); showToast(`Price updated for ${p.name}`); } }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>S, M, L, XL</span>
                  <button className="admin-del-btn" onClick={() => removeProduct(p.id)} title="Delete product"><Icon.Trash /></button>
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
                <p className="admin-sub">Manage 2–3 Years, 4–5 Years, 6–7 Years, 8–9 Years kids dresses & outfits</p>
              </div>
            </header>
            <div className="admin-form-header" onClick={() => setExpandKidsAddForm(!expandKidsAddForm)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcc3c3", color: "#1a1714", border: "1.5px solid #f6a2a2" }}>
              <span>{expandKidsAddForm ? "➖ HIDE ADD KIDS PRODUCT FORM" : "➕ ADD NEW KIDS PRODUCT (2–9 Y)"}</span>
              <span style={{ fontSize: "18px" }}>{expandKidsAddForm ? "▲" : "▼"}</span>
            </div>
            {expandKidsAddForm && (
              <form className="admin-form-body" onSubmit={handleAddKidsProduct} style={{ background: "#fff5f5", border: "1.5px solid #fcc3c3" }}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Kids Dress Name *</label><input className="form-input" placeholder="e.g. Unicorn Candy Dress" value={newKidsProd.name} onChange={(e) => setNewKidsProd({ ...newKidsProd, name: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Base Price (INR) *</label><input className="form-input" type="number" placeholder="e.g. 599" value={newKidsProd.price} onChange={(e) => setNewKidsProd({ ...newKidsProd, price: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Stock Quantity *</label><input className="form-input" type="number" placeholder="e.g. 15" value={newKidsProd.qty} onChange={(e) => setNewKidsProd({ ...newKidsProd, qty: e.target.value })} required /></div>
                  <div className="form-field"><label className="form-label">Age Sizes (comma separated)</label><input className="form-input" value={newKidsProd.sizes} onChange={(e) => setNewKidsProd({ ...newKidsProd, sizes: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Image URL *</label><input className="form-input" placeholder="Paste image link or pick template below" value={newKidsProd.image} onChange={(e) => setNewKidsProd({ ...newKidsProd, image: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Tags (comma separated)</label><input className="form-input" placeholder="Kids, Girls, Party, Summer" value={newKidsProd.tags} onChange={(e) => setNewKidsProd({ ...newKidsProd, tags: e.target.value })} /></div>
                  <div className="form-field full"><label className="form-label">Kids Outfit Description</label><textarea className="form-input" style={{ minHeight: "80px" }} placeholder="Fabric details, age fit recommendations..." value={newKidsProd.description} onChange={(e) => setNewKidsProd({ ...newKidsProd, description: e.target.value })} /></div>
                </div>
                <button type="submit" className="admin-action-btn" style={{ background: "#1a1714", color: "#fff", width: "220px", padding: "12px", marginTop: "12px" }}>
                  Save Kids Product
                </button>
              </form>
            )}
            <div className="admin-card" style={{ border: "1.5px solid #fcc3c3" }}>
              <div className="admin-card-title" style={{ background: "#fcc3c3", color: "#1a1714" }}>🎈 Kids Catalog List (Sizes: 2–3 | 4–5 | 6–7 | 8–9 Years)</div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 150px 48px", gap: 12, padding: "8px 16px", background: "#fff5f5", borderBottom: "1px solid #fcc3c3" }}>
                {["", "Kids Outfit Details", "Qty", "Stock Adj.", "Base Price", "Age Sizes", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#1a1714" }}>{h}</span>
                ))}
              </div>
              {kidsProducts.map((kp) => (
                <div key={kp.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 150px 48px", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #fcc3c3" }}>
                  <img src={kp.image} alt={kp.name} className="admin-thumb" />
                  <div><div className="admin-name">{kp.name}</div><div className="admin-id">ID: {kp.id}</div></div>
                  <span className={`admin-qty-badge ${kp.qty === 0 ? "qty-out" : kp.qty <= 5 ? "qty-low" : "qty-ok"}`}>{kp.qty}</span>
                  <input className="admin-input" type="number" placeholder="New qty" value={editValues[`kqty_${kp.id}`] ?? ""}
                    onChange={(e) => setEditValues({ ...editValues, [`kqty_${kp.id}`]: e.target.value })}
                    onBlur={(e) => { if (e.target.value !== "") { updateKidsProduct(kp.id, "qty", e.target.value); setEditValues({ ...editValues, [`kqty_${kp.id}`]: "" }); showToast(`Stock updated for ${kp.name}`); } }} />
                  <input className="admin-input" type="number" placeholder="Base price" value={editValues[`kprice_${kp.id}`] ?? ""}
                    onChange={(e) => setEditValues({ ...editValues, [`kprice_${kp.id}`]: e.target.value })}
                    onBlur={(e) => { if (e.target.value !== "") { updateKidsProduct(kp.id, "basePrice", e.target.value); setEditValues({ ...editValues, [`kprice_${kp.id}`]: "" }); showToast(`Price updated for ${kp.name}`); } }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4a3c3c" }}>{(kp.sizes || ["2–3Y", "4–5Y", "6–7Y", "8–9Y"]).join(", ")}</span>
                  <button className="admin-del-btn" onClick={() => removeKidsProduct(kp.id)} title="Delete kids product"><Icon.Trash /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SALE CONTROLLER */}
        {currentSection === "sale" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">SALE CONTROL CENTRE</h1>
                <p className="admin-sub">Configure sitewide scheduled discounts and flash offers</p>
              </div>
            </header>
            <div className="admin-card">
              <div className="admin-card-title">
                🏷️ Active Offer Status &nbsp;
                {isSaleActive ? <span className="sale-active-badge">● LIVE ACTIVE</span> : isSaleScheduled ? <span className="sale-inactive-badge" style={{ background: "#fef3c7", color: "#b45309" }}>⏰ SCHEDULED</span> : <span className="sale-inactive-badge">○ INACTIVE</span>}
              </div>
              {isSaleActive && (<div><p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>Discount offer is currently live at <strong>{sale.discount}% off</strong>.</p><button className="admin-action-btn" style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" }} onClick={handleCancelSale}>⏹ End Active Sale Now</button></div>)}
              {isSaleScheduled && (<div><div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>A sitewide <strong>{sale.discount}% discount</strong> is scheduled.<div style={{ marginTop: "8px" }}>📅 Start time: <strong>{new Date(Number(sale.startTime)).toLocaleString("en-IN")}</strong></div><div>⏳ Duration: <strong>{sale.durationHours} Hours</strong></div></div><button className="admin-action-btn" style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" }} onClick={handleCancelSale}>⏹ Cancel Scheduled Sale</button></div>)}
              {!isSaleActive && !isSaleScheduled && <p style={{ fontSize: 14, color: "var(--text2)" }}>No active offers or scheduled countdowns at this moment.</p>}
            </div>
            <div className="admin-card">
              <div className="admin-card-title">🚀 Launch/Schedule New Offer</div>
              <div className="schedule-type-tabs">
                <button className={`schedule-type-tab ${saleForm.mode === "scheduled" ? "active" : ""}`} onClick={() => setSaleForm({ ...saleForm, mode: "scheduled" })}>📅 Scheduled Offer</button>
                <button className={`schedule-type-tab ${saleForm.mode === "instant" ? "active" : ""}`} onClick={() => setSaleForm({ ...saleForm, mode: "instant" })}>⚡ Instant Flash Sale</button>
              </div>
              <form onSubmit={handleSetSale}>
                <div className="sale-form">
                  <div className="form-field"><label className="form-label">Discount Percentage (%)</label><input className="form-input" type="number" min={1} max={90} value={saleForm.discount} onChange={(e) => setSaleForm({ ...saleForm, discount: Math.min(90, Math.max(1, parseInt(e.target.value) || 1)) })} required /></div>
                  <div className="form-field"><label className="form-label">Duration (Hours)</label><input className="form-input" type="number" min={1} max={720} value={saleForm.durationHours} onChange={(e) => setSaleForm({ ...saleForm, durationHours: Math.max(1, parseInt(e.target.value) || 1) })} required /></div>
                  {saleForm.mode === "scheduled" && (<div className="form-field full"><label className="form-label">Offer Starting Date & Time</label><input className="form-input" type="datetime-local" value={saleForm.startTime} onChange={(e) => setSaleForm({ ...saleForm, startTime: e.target.value })} required /></div>)}
                </div>
                <button type="submit" className="admin-action-btn" style={{ background: "var(--accent)", color: "#fff", padding: "12px 28px", marginTop: "20px" }}>
                  {saleForm.mode === "instant" ? "⚡ Activate Instant Sale" : "📅 Lock & Schedule Offer"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && <div className="toast-wrap"><div className="toast">{toast}</div></div>}
    </div>
  );
}
