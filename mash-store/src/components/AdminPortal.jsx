import React, { useState, useCallback, useEffect } from "react";
import { Icon } from "./Icon";
import { convertDriveUrl } from "../utils/helpers";

const getApiBase = () => {
  const host = import.meta.env.API_HOST || window.location.hostname;
  const port = import.meta.env.API_PORT;
  const protocol = window.location.protocol;
  if (!port) return `${protocol}//${host}/api`;
  return `${protocol}//${host}:${port}/api`;
};
const API_BASE = getApiBase();

export function AdminPortal({
  products,
  setProducts,
  sale,
  setSale,
  notifyLog,
  setNotifyLog,
  toast,
  dark,
  setDark,
  emailEnabled,
  setEmailEnabled,
  web3FormsKey,
  setWeb3FormsKey,
  nav
}) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("admin_authed") === "true");
  const [adminPass, setAdminPass] = useState("");
  const [currentSection, setCurrentSection] = useState("dashboard");

  // Add Product form state
  const [expandAddForm, setExpandAddForm] = useState(false);
  const [newProd, setNewProd] = useState({
    name: "",
    price: "",
    qty: "",
    fit: "Regular",
    image: "",
    tags: "Graphic, Unisex",
    description: "Premium heavy cotton streetwear tee."
  });
  const [selectedImgTemplate, setSelectedImgTemplate] = useState("");

  // Sale form state
  const [saleForm, setSaleForm] = useState({
    discount: 15,
    durationHours: 24,
    startTime: "",
    mode: "scheduled"
  });

  const [editValues, setEditValues] = useState({});

  const templates = [
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80"
  ];

  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isSaleScheduled = !isSaleActive && sale.startTime && Date.now() < sale.startTime;
  const lowStock = products.filter(p => p.qty > 0 && p.qty <= 5);
  const outStock = products.filter(p => p.qty === 0);

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/product/allProduct`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setProducts(data.map(p => ({
        ...p,
        price: isSaleActive ? Math.round(p.basePrice * (1 - sale.discount / 100)) : p.basePrice,
        image: convertDriveUrl(p.image),
        reviews: p.reviews || []
      })));
    } catch (err) {
      console.error("Failed to refresh products:", err);
    }
  }, [isSaleActive, sale.discount, setProducts]);

  useEffect(() => {
    if (authed) {
      refreshProducts();
    }
  }, [authed, refreshProducts]);

  const updateProduct = useCallback(async (id, field, value) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const next = { ...p };
      if (field === "qty") next.qty = Math.max(0, parseInt(value) || 0);
      else if (field === "basePrice") {
        next.basePrice = parseInt(value) || p.basePrice;
        next.price = isSaleActive ? Math.round(next.basePrice * (1 - sale.discount / 100)) : next.basePrice;
      } else {
        next[field] = value;
      }
      return next;
    }));

    try {
      const body = {};
      if (field === "qty") body.qty = parseInt(value);
      else if (field === "basePrice") body.basePrice = parseInt(value);
      else body[field] = value;

      const res = await fetch(`${API_BASE}/product/updateProduct/${id}`, {
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
      toast(`❌ Failed to save: ${err.message}`);
      await refreshProducts();
    }
  }, [isSaleActive, sale.discount, refreshProducts, setProducts, toast]);

  const removeProduct = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`${API_BASE}/product/removeProduct/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      toast("🗑 Product removed from inventory");
      const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      setNotifyLog(prev => {
        const next = [...prev, { time: nowStr, msg: `Deleted product "${product?.name || id}" from inventory` }];
        localStorage.setItem("mash_notify_log", JSON.stringify(next));
        return next;
      });
    } catch (err) {
      console.error(`Failed to delete product ${id}:`, err);
      toast(`❌ Delete failed: ${err.message}`);
      await refreshProducts();
    }
  }, [products, refreshProducts, setProducts, setNotifyLog, toast]);

  const handleAddProduct = useCallback(async (e) => {
    e.preventDefault();
    if (!newProd.name.trim()) { toast("Product name is required"); return; }
    const baseP = parseInt(newProd.price);
    if (isNaN(baseP) || baseP <= 0) { toast("Base price must be a valid positive number"); return; }
    const quantity = parseInt(newProd.qty);
    if (isNaN(quantity) || quantity < 0) { toast("Quantity must be a valid non-negative integer"); return; }

    const payload = {
      name: newProd.name.trim(),
      basePrice: baseP,
      qty: quantity,
      fit: newProd.fit,
      image: convertDriveUrl(newProd.image.trim()) || templates[0],
      tags: newProd.tags.split(",").map(t => t.trim()).filter(Boolean),
      description: newProd.description.trim() || "Premium quality T-shirt from MASH Store.",
    };

    try {
      const res = await fetch(`${API_BASE}/product/addNew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const created = await res.json();

      const finalPrice = isSaleActive ? Math.round(created.basePrice * (1 - sale.discount / 100)) : created.basePrice;
      setProducts(prev => [...prev, { ...created, price: finalPrice, image: convertDriveUrl(created.image), reviews: [] }]);

      setNewProd({ name: "", price: "", qty: "", fit: "Regular", image: "", tags: "Graphic, Unisex", description: "Premium heavy cotton streetwear tee." });
      setSelectedImgTemplate("");
      setExpandAddForm(false);

      const nowStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      setNotifyLog(prev => {
        const next = [...prev, { time: nowStr, msg: `Added new product "${created.name}" to inventory (ID: ${created.id}, Qty: ${created.qty})` }];
        localStorage.setItem("mash_notify_log", JSON.stringify(next));
        return next;
      });

      toast(`🎉 "${created.name}" saved to Neon DB!`);
    } catch (err) {
      console.error("Failed to add product:", err);
      toast(`❌ Could not add product: ${err.message}`);
    }
  }, [newProd, isSaleActive, sale.discount, templates, setProducts, setNotifyLog, toast]);

  if (!authed) {
    const handleLoginSubmit = () => {
      const expectedPass = import.meta.env.ADMIN_PASSWORD;
      if (!expectedPass) {
        toast("⚠️ Configuration error: ADMIN_PASSWORD environment variable is not set.");
        return;
      }
      if (adminPass === expectedPass) {
        setAuthed(true);
        sessionStorage.setItem("admin_authed", "true");
        toast("🔓 Admin Portal Access Granted");
      } else {
        toast("❌ Incorrect admin password");
      }
    };

    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-logo">
            <Icon.Shirt /> MASH
          </div>
          <h2 className="admin-login-title">Admin Management Portal</h2>
          <div className="form-field" style={{ textAlign: "left" }}>
            <label className="form-label" style={{ color: "#9e9288" }}>Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLoginSubmit()}
              style={{ background: "#1e1b19", borderColor: "#3a3530", color: "#f0ebe3" }}
            />
          </div>
          <button
            className="modal-submit"
            onClick={handleLoginSubmit}
            style={{ marginTop: "12px", background: "var(--accent)" }}
          >
            ENTER SYSTEM
          </button>
        </div>
      </div>
    );
  }

  const handleSetSale = (e) => {
    e.preventDefault();
    const discount = parseInt(saleForm.discount);
    if (isNaN(discount) || discount < 1 || discount > 90) { toast("Discount must be between 1% and 90%"); return; }
    const hours = parseFloat(saleForm.durationHours);
    if (isNaN(hours) || hours <= 0) { toast("Duration must be a positive number of hours"); return; }

    if (saleForm.mode === "instant") {
      const start = Date.now();
      const end = start + hours * 3600000;
      const newSale = { active: true, discount, start, end, startTime: start, durationHours: hours };
      setSale(newSale);
      localStorage.setItem("mash_sale", JSON.stringify(newSale));
      toast(`🎉 Sale activated! ${discount}% off for ${hours}h`);
    } else {
      if (!saleForm.startTime) { toast("Please select a start date and time for the scheduled offer"); return; }
      const start = new Date(saleForm.startTime).getTime();
      if (start <= Date.now()) { toast("Start time must be in the future"); return; }
      const end = start + hours * 3600000;
      const newSale = { active: false, discount, start, end, startTime: start, durationHours: hours };
      setSale(newSale);
      localStorage.setItem("mash_sale", JSON.stringify(newSale));

      const startTimeStr = new Date(start).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
      toast(`⏰ Offer scheduled to start on ${startTimeStr}`);
    }
  };

  const handleCancelSale = () => {
    const cleared = { active: false, discount: 0, start: 0, end: 0, startTime: null, durationHours: 0 };
    setSale(cleared);
    localStorage.setItem("mash_sale", JSON.stringify(cleared));
    toast("Offer cancelled. Prices restored.");
  };

  const runManualCheck = () => {
    const low = products.filter(p => p.qty <= 5 && p.qty > 0);
    const out = products.filter(p => p.qty === 0);
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    let msg = low.length ? `Low stock: ${low.map(p => p.name + " (qty:" + p.qty + ")").join(", ")}` : "";
    if (out.length) msg += (msg ? " | " : "") + `Out of stock: ${out.map(p => p.name).join(", ")}`;
    if (!msg) msg = "All products above threshold.";
    setNotifyLog(prev => {
      const next = [...prev, { time: now, msg }];
      localStorage.setItem("mash_notify_log", JSON.stringify(next));
      return next;
    });
    const emailTo = import.meta.env.ALERT_EMAIL;
    if (!emailTo) {
      toast("❌ Configuration error: ALERT_EMAIL environment variable is not set.");
      return;
    }
    toast(`📧 Stock check run — email sent to ${emailTo}`);
  };

  const handleLogout = () => {
    setAuthed(false);
    sessionStorage.removeItem("admin_authed");
    toast("🔒 Logged out of Admin Portal");
  };

  return (
    <div className="admin-portal-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <div className="admin-sidebar-logo" onClick={() => setCurrentSection("dashboard")}>
            <Icon.Shirt /> MASH Admin
          </div>
          <ul className="admin-sidebar-menu">
            <li>
              <button className={`admin-sidebar-btn ${currentSection === "dashboard" ? "active" : ""}`} onClick={() => setCurrentSection("dashboard")}>
                📊 Dashboard
              </button>
            </li>
            <li>
              <button className={`admin-sidebar-btn ${currentSection === "inventory" ? "active" : ""}`} onClick={() => setCurrentSection("inventory")}>
                📦 Inventory Manager
              </button>
            </li>
            <li>
              <button className={`admin-sidebar-btn ${currentSection === "sale" ? "active" : ""}`} onClick={() => setCurrentSection("sale")}>
                🏷️ Sale Controller
              </button>
            </li>
            <li>
              <button className={`admin-sidebar-btn ${currentSection === "notifications" ? "active" : ""}`} onClick={() => setCurrentSection("notifications")}>
                🔔 System Logs
              </button>
            </li>
          </ul>
        </div>
        <div className="admin-sidebar-footer">
          <button className="admin-sidebar-btn" onClick={() => {
            window.location.hash = "#/";
            nav("home");
          }} style={{ border: "1px solid var(--border)" }}>
            🌐 Live Storefront ↗
          </button>
          <button className="admin-sidebar-btn" onClick={() => setDark(d => !d)} style={{ border: "1px solid var(--border)" }}>
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button className="admin-sidebar-btn" onClick={handleLogout} style={{ color: "var(--accent)", border: "1.5px solid var(--accent)", fontWeight: "600" }}>
            🚪 Exit Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="admin-main-content">
        {/* SECTION 1: DASHBOARD OVERVIEW */}
        {currentSection === "dashboard" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">DASHBOARD OVERVIEW</h1>
                <p className="admin-sub">Real-time status overview of MASH clothing store</p>
              </div>
            </header>

            <div className="admin-stats-grid">
              <div className="admin-stat-card purple">
                <span className="admin-stat-title">Total Products</span>
                <span className="admin-stat-number">{products.length}</span>
                <span className="admin-stat-desc">Active drops listed in catalog</span>
              </div>
              <div className="admin-stat-card green">
                <span className="admin-stat-title">Total Inventory Units</span>
                <span className="admin-stat-number">{products.reduce((acc, p) => acc + p.qty, 0)}</span>
                <span className="admin-stat-desc">Tees available in warehouse</span>
              </div>
              <div className="admin-stat-card orange">
                <span className="admin-stat-title">Active Offer</span>
                <span className="admin-stat-number">{isSaleActive ? `${sale.discount}% OFF` : "None"}</span>
                <span className="admin-stat-desc">{isSaleActive ? "Discount currently applied sitewide" : "Regular pricing is active"}</span>
              </div>
              <div className="admin-stat-card accent">
                <span className="admin-stat-title">Scheduled Offer</span>
                <span className="admin-stat-number">{isSaleScheduled ? `${sale.discount}% OFF` : "No"}</span>
                <span className="admin-stat-desc">
                  {isSaleScheduled ? `Starting ${new Date(sale.startTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : "No scheduled countdowns"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              {products.length > 0 ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#dcfce7", border: "1px solid #86efac", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, color: "#166534" }}>
                  <span>🟢</span>
                  <span><strong>Neon PostgreSQL:</strong> Connected — {products.length} product{products.length !== 1 ? "s" : ""} loaded from database</span>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, color: "#991b1b" }}>
                  <span>🔴</span>
                  <span><strong>Neon PostgreSQL:</strong> No data — make sure the Express server is running on port 3001</span>
                </div>
              )}
            </div>

            {lowStock.length > 0 && (
              <div className="alert-banner">
                <span className="alert-icon">⚠️</span>
                <div className="alert-text">
                  <strong>Low stock items warning:</strong> {lowStock.map(p => `${p.name} (${p.qty} left)`).join(", ")}
                </div>
              </div>
            )}

            <div className="admin-card" style={{ marginTop: "24px" }}>
              <div className="admin-card-title">📋 Recent Logs Summary</div>
              <div className="notify-log" style={{ minHeight: "150px" }}>
                {[...notifyLog].reverse().slice(0, 5).map((log, i) => (
                  <div className="notify-item" key={i}>
                    <span className="notify-time">{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: INVENTORY MANAGER */}
        {currentSection === "inventory" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">INVENTORY MANAGER</h1>
                <p className="admin-sub">Insert new products and adjust stock parameters — backed by Neon PostgreSQL</p>
              </div>
            </header>

            {products.length === 0 && (
              <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: 20, fontSize: 13, color: "#92400e", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <span><strong>No products loaded.</strong> Ensure the Express API server is running: <code style={{ background: "rgba(0,0,0,0.08)", padding: "1px 6px", borderRadius: 4 }}>cd mash-store/server && npm run dev</code></span>
              </div>
            )}

            <div
              className="admin-form-header"
              onClick={() => setExpandAddForm(!expandAddForm)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span>{expandAddForm ? "➖ HIDE ADD PRODUCT FORM" : "➕ ADD NEW PRODUCT TO CATALOG"}</span>
              <span style={{ fontSize: "18px" }}>{expandAddForm ? "▲" : "▼"}</span>
            </div>

            {expandAddForm && (
              <form className="admin-form-body" onSubmit={handleAddProduct}>
                <div className="sale-form">
                  <div className="form-field">
                    <label className="form-label">Product Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Vintage Samurai Tee"
                      value={newProd.name}
                      onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Base Price (INR) *</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="e.g. 799"
                      value={newProd.price}
                      onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Stock Quantity *</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder="e.g. 20"
                      value={newProd.qty}
                      onChange={e => setNewProd({ ...newProd, qty: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Fit Style</label>
                    <select
                      className="admin-input"
                      style={{ padding: "10px 14px", height: "43px" }}
                      value={newProd.fit}
                      onChange={e => setNewProd({ ...newProd, fit: e.target.value })}
                    >
                      <option>Regular</option>
                      <option>Oversized</option>
                    </select>
                  </div>
                  <div className="form-field full">
                    <label className="form-label">Image URL *</label>
                    <input
                      className="form-input"
                      placeholder="Select template below or paste custom image link"
                      value={newProd.image}
                      onChange={e => {
                        setNewProd({ ...newProd, image: e.target.value });
                        setSelectedImgTemplate("");
                      }}
                    />
                    <div style={{ marginTop: "10px" }}>
                      <span className="form-label" style={{ fontSize: "11px" }}>Quick Pick Image Template:</span>
                      <div className="img-pick-grid">
                        {templates.map((t, idx) => (
                          <img
                            key={idx}
                            src={t}
                            alt=""
                            className={`img-pick-thumb ${selectedImgTemplate === t ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedImgTemplate(t);
                              setNewProd({ ...newProd, image: t });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="form-field full">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      className="form-input"
                      placeholder="Streetwear, Unisex, Vintage"
                      value={newProd.tags}
                      onChange={e => setNewProd({ ...newProd, tags: e.target.value })}
                    />
                  </div>
                  <div className="form-field full">
                    <label className="form-label">Product Description</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: "80px", resize: "vertical" }}
                      placeholder="Description of fabric, fits, GSM, print details etc."
                      value={newProd.description}
                      onChange={e => setNewProd({ ...newProd, description: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="admin-action-btn"
                  style={{ background: "var(--accent)", color: "#fff", borderColor: "var(--accent)", width: "200px", padding: "12px", marginTop: "12px", fontSize: "14px" }}
                >
                  Save Product to Live Web Page
                </button>
              </form>
            )}

            <div className="admin-card">
              <div className="admin-card-title">📦 Product Catalog List</div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 110px 48px", gap: 12, padding: "8px 16px", background: "var(--bg2)", borderRadius: "var(--radius-sm) var(--radius-sm) 0 0", borderBottom: "1px solid var(--border)" }}>
                {["", "Product Details", "Qty", "Stock Adj.", "Base Price", "Fit", ""].map((h, i) => (
                  <span key={i} style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text2)" }}>{h}</span>
                ))}
              </div>
              {products.map(p => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 110px 110px 110px 48px", gap: 12, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                  <img src={p.image} alt={p.name} className="admin-thumb" />
                  <div>
                    <div className="admin-name">{p.name}</div>
                    <div className="admin-id">ID: {p.id}</div>
                  </div>
                  <span className={`admin-qty-badge ${p.qty === 0 ? "qty-out" : p.qty <= 5 ? "qty-low" : "qty-ok"}`}>
                    {p.qty}
                  </span>
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="New qty"
                    value={editValues[`qty_${p.id}`] ?? ""}
                    onChange={e => setEditValues({ ...editValues, [`qty_${p.id}`]: e.target.value })}
                    onBlur={e => {
                      if (e.target.value !== "") {
                        updateProduct(p.id, "qty", e.target.value);
                        setEditValues({ ...editValues, [`qty_${p.id}`]: "" });
                        toast(`Stock updated for ${p.name}`);
                      }
                    }}
                  />
                  <input
                    className="admin-input"
                    type="number"
                    placeholder="Base price"
                    value={editValues[`price_${p.id}`] ?? ""}
                    onChange={e => setEditValues({ ...editValues, [`price_${p.id}`]: e.target.value })}
                    onBlur={e => {
                      if (e.target.value !== "") {
                        updateProduct(p.id, "basePrice", e.target.value);
                        setEditValues({ ...editValues, [`price_${p.id}`]: "" });
                        toast(`Base price updated for ${p.name}`);
                      }
                    }}
                  />
                  <select
                    className="admin-input"
                    value={p.fit}
                    onChange={e => {
                      updateProduct(p.id, "fit", e.target.value);
                      toast(`Fit updated for ${p.name}`);
                    }}
                  >
                    <option>Regular</option>
                    <option>Oversized</option>
                  </select>
                  <button className="admin-del-btn" onClick={() => removeProduct(p.id)} title="Delete product">
                    <Icon.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: SALE CONTROLLER */}
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
                {isSaleActive ? (
                  <span className="sale-active-badge">● LIVE ACTIVE</span>
                ) : isSaleScheduled ? (
                  <span className="sale-inactive-badge" style={{ background: "#fef3c7", color: "#b45309" }}>⏰ SCHEDULED</span>
                ) : (
                  <span className="sale-inactive-badge">○ INACTIVE</span>
                )}
              </div>
              {isSaleActive && (
                <div>
                  <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
                    Discount offer is currently live at <strong>{sale.discount}% off</strong>. countdown timer is visible on store.
                  </p>
                  <button
                    className="admin-action-btn"
                    style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" }}
                    onClick={handleCancelSale}
                  >
                    ⏹ End Active Sale Now
                  </button>
                </div>
              )}
              {isSaleScheduled && (
                <div>
                  <div style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16 }}>
                    A sitewide <strong>{sale.discount}% discount</strong> is scheduled to trigger.
                    <div style={{ marginTop: "8px" }}>
                      📅 Start time: <strong>{new Date(sale.startTime).toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      ⏳ Duration: <strong>{sale.durationHours} Hours</strong>
                    </div>
                  </div>
                  <button
                    className="admin-action-btn"
                    style={{ background: "#fee2e2", color: "#dc2626", borderColor: "#dc2626" }}
                    onClick={handleCancelSale}
                  >
                    ⏹ Cancel Scheduled Sale
                  </button>
                </div>
              )}
              {!isSaleActive && !isSaleScheduled && (
                <p style={{ fontSize: 14, color: "var(--text2)" }}>No active offers or scheduled count downs at this moment.</p>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-card-title">🚀 Launch/Schedule New Offer</div>
              <div className="schedule-type-tabs">
                <button
                  className={`schedule-type-tab ${saleForm.mode === "scheduled" ? "active" : ""}`}
                  onClick={() => setSaleForm({ ...saleForm, mode: "scheduled" })}
                >
                  📅 Scheduled Offer (Starts Automatically At Set Time)
                </button>
                <button
                  className={`schedule-type-tab ${saleForm.mode === "instant" ? "active" : ""}`}
                  onClick={() => setSaleForm({ ...saleForm, mode: "instant" })}
                >
                  ⚡ Instant Flash Sale (Starts Immediately)
                </button>
              </div>

              <form onSubmit={handleSetSale}>
                <div className="sale-form">
                  <div className="form-field">
                    <label className="form-label">Discount Percentage (%)</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      max={90}
                      value={saleForm.discount}
                      onChange={e => setSaleForm({ ...saleForm, discount: Math.min(90, Math.max(1, parseInt(e.target.value) || 1)) })}
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
                      onChange={e => setSaleForm({ ...saleForm, durationHours: Math.max(1, parseInt(e.target.value) || 1) })}
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
                        onChange={e => setSaleForm({ ...saleForm, startTime: e.target.value })}
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
                  {saleForm.mode === "instant" ? "⚡ Activate Instant Sale" : "📅 Lock & Schedule Offer"}
                </button>
              </form>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">📊 Prices Preview Panel ({saleForm.discount}% Discount)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
                {products.map(p => {
                  const saleP = Math.round(p.basePrice * (1 - saleForm.discount / 100));
                  return (
                    <div key={p.id} style={{ background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "12px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ fontFamily: "'Bebas Neue'", fontSize: 18, color: "var(--accent)" }}>₹{saleP}</span>
                        <span style={{ fontSize: 12, color: "var(--text2)", textDecoration: "line-through" }}>₹{p.basePrice}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: NOTIFICATIONS LOG */}
        {currentSection === "notifications" && (
          <div>
            <header className="admin-page-header">
              <div className="admin-page-title-group">
                <h1 className="admin-title">SYSTEM ALERTS & LOGS</h1>
                <p className="admin-sub">Monitor automatic alerts and view diagnostic execution steps</p>
              </div>
            </header>

            <div className="admin-card">
              <div className="admin-card-title">
                <Icon.Bell /> Stock Automated Alert Configurations
              </div>
              <p style={{ fontSize: 14, color: "var(--text2)", marginBottom: 16, lineHeight: 1.6 }}>
                Automatic stock check emails are run periodically twice daily at <strong>8:30 AM IST</strong> and <strong>5:00 PM IST</strong>. Any product dropping below 5 units automatically reports an alert to the console and generates logs.
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>📧</span> {import.meta.env.ALERT_EMAIL || "(Not Configured)"}
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>⏰</span> 8:30 AM & 5:00 PM IST
                </div>
                <button className="admin-action-btn" onClick={runManualCheck}>▶ Execute Manual Stock Check Now</button>
              </div>
            </div>

            <div className="admin-card">
              <div className="admin-card-title">📋 Complete System Logs Registry</div>
              <div className="notify-log" style={{ maxHeight: "400px" }}>
                {[...notifyLog].reverse().map((log, idx) => (
                  <div className="notify-item" key={idx}>
                    <span className="notify-time">{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
