import { useState, useEffect, useCallback } from "react";
import "./global.css";
import { Icon } from "./components/Icon";
import { AuthModal } from "./components/AuthModal";
import { AdminPortal } from "./components/AdminPortal";
import { getSalePrice, convertDriveUrl, sendEmailNotification } from "./utils/helpers";
import { useToast, useCountdown, useHash } from "./useHooks";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function App() {
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [authModal, setAuthModal] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);

  // Products — loaded from Neon PostgreSQL via Express API
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Fetch products from the backend on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const res = await fetch(`${API_BASE}/product/allProduct`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        // Normalize: add runtime `price` field (= basePrice, adjusted by sale later)
        setProducts(data.map(p => ({ ...p, price: p.basePrice, image: convertDriveUrl(p.image), reviews: p.reviews || [] })));
      } catch (err) {
        console.error("Failed to load products from API:", err);
        setProductsError("Could not connect to MASH Store API. Make sure the server is running on port 3001.");

        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sale state (initialized from localStorage)
  const [sale, setSale] = useState(() => {
    const saved = localStorage.getItem("mash_sale");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load sale state from localStorage", e);
      }
    }
    return { active: false, discount: 0, start: 0, end: 0, startTime: null, durationHours: 0 };
  });

  // Notification log (initialized from localStorage)
  const [notifyLog, setNotifyLog] = useState(() => {
    const saved = localStorage.getItem("mash_notify_log");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load notifications from localStorage", e);
      }
    }
    return [
      { time: "09:00 AM", msg: "Stock check: All products above threshold." },
    ];
  });

  const { toasts, add: toast } = useToast();

  const [emailEnabled, setEmailEnabled] = useState(() => {
    return localStorage.getItem("mash_email_enabled") === "true";
  });
  const [web3FormsKey, setWeb3FormsKey] = useState(() => {
    return localStorage.getItem("mash_web3forms_key") || "";
  });

  useEffect(() => {
    localStorage.setItem("mash_email_enabled", emailEnabled);
  }, [emailEnabled]);

  useEffect(() => {
    localStorage.setItem("mash_web3forms_key", web3FormsKey);
  }, [web3FormsKey]);

  const currentHash = useHash();
  const hostname = window.location.hostname;
  const isAdminDomain = hostname.includes("mashstore-admin") || hostname === "mashstore-admin.in" || hostname === "www.mashstore-admin.in";
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const isAdminRoute = isAdminDomain || (isLocal && (currentHash === "#/admin" || currentHash.startsWith("#/admin?")));

  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
  }, [dark]);

  // NOTE: Products are now persisted in Neon PostgreSQL via the API.
  // Individual write operations (add/update/delete) call the API directly.
  // No localStorage sync needed for products.

  useEffect(() => {
    localStorage.setItem("mash_sale", JSON.stringify(sale));
  }, [sale]);

  useEffect(() => {
    localStorage.setItem("mash_notify_log", JSON.stringify(notifyLog));
  }, [notifyLog]);

  // Tab synchronization storage listener (sale & notifications still use localStorage)
  useEffect(() => {
    const handleStorage = (e) => {
      // Products are now in DB — no localStorage sync needed for products
      if (e.key === "mash_sale") {
        try {
          const val = JSON.parse(e.newValue);
          if (val) setSale(val);
        } catch (err) { console.error(err); }
      }
      if (e.key === "mash_notify_log") {
        try {
          const val = JSON.parse(e.newValue);
          if (val) setNotifyLog(val);
        } catch (err) { console.error(err); }
      }
      if (e.key === "mash_email_enabled") {
        setEmailEnabled(e.newValue === "true");
      }
      if (e.key === "mash_web3forms_key") {
        setWeb3FormsKey(e.newValue || "");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Apply/remove sale prices when sale changes
  useEffect(() => {
    setProducts(prev => prev.map(p => {
      const salePrice = getSalePrice(p, sale);
      return { ...p, price: salePrice !== null ? salePrice : p.basePrice };
    }));
  }, [sale]);

  // Background timer to check and trigger scheduled offers
  useEffect(() => {
    const checkScheduledSale = () => {
      const now = Date.now();
      if (sale.startTime) {
        const start = Number(sale.startTime);
        const durationMs = Number(sale.durationHours) * 3600000;
        const end = start + durationMs;

        if (now >= start && now <= end) {
          // Time to start the sale
          if (!sale.active) {
            setSale(prev => {
              const updated = { ...prev, active: true, start, end };
              localStorage.setItem("mash_sale", JSON.stringify(updated));
              return updated;
            });
            toast(`🎉 Offer live! Sitewide ${sale.discount}% off starts now.`);
          }
        } else if (now > end) {
          // Sale has expired
          if (sale.active || sale.startTime !== null) {
            const cleared = { active: false, discount: 0, start: 0, end: 0, startTime: null, durationHours: 0 };
            setSale(cleared);
            localStorage.setItem("mash_sale", JSON.stringify(cleared));
            toast("Offer expired. Prices restored to original.");
          }
        } else {
          // Before start time, guarantee active is false
          if (sale.active) {
            setSale(prev => ({ ...prev, active: false }));
          }
        }
      }
    };

    checkScheduledSale();
    const interval = setInterval(checkScheduledSale, 1000);
    return () => clearInterval(interval);
  }, [sale, toast]);

  // Simulated stock-check job (runs at mount to demo; in real app: cron at 8:30 AM & 5:00 PM IST)
  useEffect(() => {
    const runStockCheck = () => {
      const low = products.filter(p => p.qty <= 5 && p.qty > 0);
      const out = products.filter(p => p.qty === 0);
      const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      let msgs = [];
      if (low.length) msgs.push(`Low stock: ${low.map(p => p.name + " (qty:" + p.qty + ")").join(", ")}`);
      if (out.length) msgs.push(`Out of stock: ${out.map(p => p.name).join(", ")}`);
      if (msgs.length === 0) msgs.push("All products above threshold.");
      const msgText = msgs.join(" | ");

      setNotifyLog(prev => {
        const next = [...prev, { time: now, msg: msgText }];
        localStorage.setItem("mash_notify_log", JSON.stringify(next));
        return next;
      });

      // Send actual email if enabled in storage
      const key = localStorage.getItem("mash_web3forms_key");
      const enabled = localStorage.getItem("mash_email_enabled") === "true";
      if (enabled && key && (low.length || out.length)) {
        sendEmailNotification(key, msgs.join("\n"), toast);
      }
    };
    runStockCheck();
    
    let timerId;
    const scheduleNextCheck = () => {
      const now = new Date();
      
      const t830 = new Date(now);
      t830.setHours(8, 30, 0, 0);
      
      const t1700 = new Date(now);
      t1700.setHours(17, 0, 0, 0);
      
      let nextTarget;
      if (now < t830) {
        nextTarget = t830;
      } else if (now < t1700) {
        nextTarget = t1700;
      } else {
        nextTarget = new Date(t830);
        nextTarget.setDate(nextTarget.getDate() + 1);
      }
      
      const msUntil = nextTarget - now;
      timerId = setTimeout(() => {
        runStockCheck();
        scheduleNextCheck();
      }, msUntil);
    };
    scheduleNextCheck();
    return () => clearTimeout(timerId);
  }, [products]);

  const cartCount = cart.length;
  const wishCount = wishlist.length;

  const addToCart = (product) => {
    if (product.qty <= 0) { toast("Out of stock!"); return; }
    setCart(c => {
      const ex = c.find(x => x.product.id === product.id);
      if (ex) return c.map(x => x.product.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { product, qty: 1 }];
    });
    toast(`"${product.name}" added to cart`);
  };

  const removeFromCart = (id) => setCart(c => c.filter(x => x.product.id !== id));
  const changeQty = (id, delta) => setCart(c => c.map(x => x.product.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));

  const toggleWishlist = (product) => {
    if (wishlist.includes(product.id)) { setWishlist(w => w.filter(id => id !== product.id)); toast("Removed from wishlist"); }
    else { setWishlist(w => [...w, product.id]); toast(`"${product.name}" wishlisted`); }
  };

  const moveToCart = (product) => { setWishlist(w => w.filter(id => id !== product.id)); addToCart(product); };

  const nav = (p, product = null) => {
    setPage(p); if (product) setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogin = (name) => { setLoggedIn(true); setUser(name); setAuthModal(null); toast(`Welcome, ${name}!`); };

  const handleOrderSuccess = (cartSnapshot) => {
    // Reduce product qty
    setProducts(prev => prev.map(p => {
      const item = cartSnapshot.find(x => x.product.id === p.id);
      return item ? { ...p, qty: Math.max(0, p.qty - item.qty) } : p;
    }));
    setCart([]);
    setShowCheckout(false);
    toast("🎉 Order placed! Thanks for shopping with MASH.");
    nav("home");
  };

  const grandTotal = cart.reduce((s, x) => s + x.product.price * x.qty, 0);

  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isUpcomingSale = !isSaleActive && sale.startTime && Date.now() < sale.startTime;
  const hasBanner = isSaleActive || isUpcomingSale;

  if (isAdminRoute) {
    return (
      <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"'DM Sans',sans-serif" }}>
        <AdminPortal
          products={products}
          setProducts={setProducts}
          sale={sale}
          setSale={setSale}
          notifyLog={notifyLog}
          setNotifyLog={setNotifyLog}
          toast={toast}
          dark={dark}
          setDark={setDark}
          emailEnabled={emailEnabled}
          setEmailEnabled={setEmailEnabled}
          web3FormsKey={web3FormsKey}
          setWeb3FormsKey={setWeb3FormsKey}
          nav={nav}
        />
        {/* TOASTS */}
        <div className="toast-wrap">{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"'DM Sans',sans-serif" }}>

      {/* Sale banners */}
      {isSaleActive && <SaleBanner sale={sale} />}
      {isUpcomingSale && <UpcomingSaleBanner sale={sale} />}

      {/* NAV */}
      <nav className="nav" style={{ top: hasBanner ? 40 : 0 }}>
        <div className="nav-logo" onClick={() => nav("home")}><Icon.Shirt />MASH</div>
        <div className="nav-right">
          <button className="icon-btn" onClick={() => setDark(d => !d)} title="Toggle theme">
            {dark ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          {loggedIn ? (
            <button className="auth-btn" onClick={() => { setLoggedIn(false); setUser(null); toast("Logged out"); }}>
              {user?.split(" ")[0]} · Logout
            </button>
          ) : (
            <>
              <button className="auth-btn" onClick={() => setAuthModal("login")}>Log in</button>
              <button className="auth-btn primary" onClick={() => setAuthModal("signup")}>Sign up</button>
            </>
          )}

          <button className="icon-btn" onClick={() => nav("wishlist")} title="Wishlist">
            <Icon.Heart filled={wishCount > 0} />
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </button>
          <button className="icon-btn" onClick={() => nav("cart")} title="Cart">
            <Icon.Cart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* PAGES */}
      <div className="page" style={{ paddingTop: hasBanner ? 104 : 64 }}>
        {page === "home" && <HomePage nav={nav} />}
        {page === "products" && <ProductsPage products={products} sale={sale} nav={nav} wishlist={wishlist} toggleWishlist={toggleWishlist} />}
        {page === "detail" && selectedProduct && (
          <DetailPage product={products.find(p => p.id === selectedProduct.id) || selectedProduct}
            nav={nav} addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist} />
        )}
        {page === "cart" && <CartPage cart={cart} nav={nav} removeFromCart={removeFromCart} changeQty={changeQty} grandTotal={grandTotal} onCheckout={() => setShowCheckout(true)} />}
        {page === "wishlist" && <WishlistPage wishlist={wishlist} products={products} nav={nav} moveToCart={moveToCart} removeFromWishlist={id => setWishlist(w => w.filter(x => x !== id))} />}
      </div>

      {/* AUTH MODAL */}
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onLogin={handleLogin} switchMode={m => setAuthModal(m)} />}

      {/* CHECKOUT MODAL */}
      {showCheckout && <CheckoutModal cart={cart} grandTotal={grandTotal} onClose={() => setShowCheckout(false)} onSuccess={handleOrderSuccess} />}

      {/* TOASTS */}
      <div className="toast-wrap">{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>
    </div>
  );
}

// ── Sale Banner ───────────────────────────────────────────────────────────────
function SaleBanner({ sale }) {
  const timer = useCountdown(sale.end);
  return (
    <div className="sale-banner" style={{ position:"fixed", top:0, left:0, right:0, zIndex:101, height:40 }}>
      <Icon.Tag /> SALE LIVE — {sale.discount}% OFF EVERYTHING!
      {timer && <span className="sale-timer">Ends in {timer}</span>}
    </div>
  );
}

// ── Upcoming Sale Banner ──────────────────────────────────────────────────────
function UpcomingSaleBanner({ sale }) {
  const timer = useCountdown(sale.startTime);
  return (
    <div className="sale-banner" style={{ position:"fixed", top:0, left:0, right:0, zIndex:101, height:40, background:"linear-gradient(90deg,#ea580c,#d4af37)", color:"#1a1714" }}>
      <span style={{ fontSize:15 }}>⏰</span> UPCOMING OFFER: {sale.discount}% DISCOUNT IN &nbsp;
      {timer && <span className="sale-timer" style={{ background:"rgba(0,0,0,0.15)", color:"#1a1714" }}>{timer}</span>}
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ nav }) {
  return (
    <div className="hero">
      <div className="hero-bg-text">MASH</div>
      <div className="hero-content">
        <div className="hero-eyebrow"><span>✦</span> New Collection 2026</div>
        <h1 className="hero-title">WEAR YOUR<br /><span>ATTITUDE</span></h1>
        <p className="hero-sub">Premium T-shirts crafted for those who refuse to blend in. Heavyweight cotton, bold graphics, zero compromise.</p>
        <button className="cta-btn" onClick={() => nav("products")}>View Products →</button>
        <div className="hero-strips">
          {["Free Shipping Above ₹999", "100% Cotton", "6 Signature Styles"].map(s => (
            <div className="strip" key={s}><div className="strip-dot" />{s}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Products Page ─────────────────────────────────────────────────────────────
function ProductsPage({ products, sale, nav, wishlist, toggleWishlist }) {
  const [fitFilter, setFitFilter] = useState("All");
  const fits = ["All", "Regular", "Oversized"];
  const filtered = fitFilter === "All" ? products : products.filter(p => p.fit === fitFilter);
  const isSaleOn = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">ALL DROPS</h1>
        <p className="products-sub">{filtered.length} style{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>
      <div className="fit-filter">
        {fits.map(f => (
          <button key={f} className={`fit-chip ${fitFilter === f ? "active" : ""}`} onClick={() => setFitFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="product-grid">
        {filtered.map(p => {
          const onSale = isSaleOn && p.price < p.basePrice;
          return (
            <div className={`product-card ${p.qty === 0 ? "oos" : ""}`} key={p.id} onClick={() => p.qty > 0 && nav("detail", p)}>
              <div className="product-img-wrap">
                <img src={p.image} alt={p.name} className="product-img" loading="lazy" />
                <div className="product-tags">
                  {p.tags.map(t => <span key={t} className="product-tag">{t}</span>)}
                  {onSale && <span className="sale-tag">{sale.discount}% OFF</span>}
                  {p.qty === 0 && <span className="oos-tag">Out of Stock</span>}
                </div>
                {p.qty > 0 && <div className="qty-tag">{p.qty <= 5 ? `Only ${p.qty} left!` : `${p.qty} in stock`}</div>}
                <button className="icon-btn" style={{ position:"absolute", top:12, right:12, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(4px)", border:"none", color: wishlist.includes(p.id) ? "#c84b2f" : "#888" }}
                  onClick={e => { e.stopPropagation(); toggleWishlist(p); }}>
                  <Icon.Heart filled={wishlist.includes(p.id)} />
                </button>
              </div>
              <div className="product-info">
                <div>
                  <div className="product-name">{p.name}</div>
                  <div style={{ fontSize:11, color:"var(--text2)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>{p.fit}</div>
                </div>
                <div className="price-row">
                  <span className="product-price"><span className="product-price-prefix">₹</span>{p.price}</span>
                  {onSale && <span className="product-price-orig">₹{p.basePrice}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail Page ───────────────────────────────────────────────────────────────
function DetailPage({ product, nav, addToCart, wishlist, toggleWishlist }) {
  const isWishlisted = wishlist.includes(product.id);
  const onSale = product.price < product.basePrice;
  const stockStatus = product.qty === 0 ? "out" : product.qty <= 5 ? "low" : "ok";
  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => nav("products")}><Icon.ArrowLeft /> Back to Products</button>
      <div className="detail-grid">
        <div className="detail-img-wrap">
          <img src={product.image} alt={product.name} className="detail-img" />
          {onSale && <div style={{ position:"absolute", top:16, left:16 }}><span className="sale-tag" style={{ fontSize:13, padding:"5px 12px" }}>SALE</span></div>}
        </div>
        <div className="detail-info">
          <div className="detail-tags">
            {product.tags.map(t => <span key={t} className="product-tag">{t}</span>)}
            <span className="product-tag" style={{ background:"#4b5563" }}>{product.fit}</span>
          </div>
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price-row">
            <span style={{ color:"var(--text2)", fontSize:16 }}>₹</span>
            <span className="detail-price">{product.price}</span>
            {onSale && <span className="detail-price-orig">₹{product.basePrice}</span>}
          </div>
          <div className={`stock-info ${stockStatus === "ok" ? "stock-ok" : stockStatus === "low" ? "stock-low" : "stock-out"}`}>
            {stockStatus === "ok" && `✓ In Stock (${product.qty} available)`}
            {stockStatus === "low" && `⚠ Only ${product.qty} left — order soon!`}
            {stockStatus === "out" && "✗ Out of Stock"}
          </div>
          <hr className="divider" />
          <p className="detail-desc">{product.description}</p>
          <div className="detail-actions">
            <button className="btn-primary" disabled={product.qty === 0} onClick={() => addToCart(product)}>
              {product.qty === 0 ? "Out of Stock" : "+ Add to Cart"}
            </button>
            <button className={`btn-secondary ${isWishlisted ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product)}>
              {isWishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
            </button>
          </div>
        </div>
      </div>
      <div className="reviews-section">
        <h2 className="reviews-title">CUSTOMER REVIEWS</h2>
        {product.reviews.map((r, i) => (
          <div className="review-card" key={i}>
            <div className="review-header">
              <span className="review-user">{r.user}</span>
              <div className="review-stars">{[1,2,3,4,5].map(s => <Icon.Star key={s} filled={s <= r.rating} />)}</div>
            </div>
            <p className="review-text">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cart Page ─────────────────────────────────────────────────────────────────
function CartPage({ cart, nav, removeFromCart, changeQty, grandTotal, onCheckout }) {
  if (cart.length === 0) return (
    <div className="cart-page">
      <h1 className="cart-title">YOUR CART</h1>
      <div className="empty-state">
        <div className="empty-icon"><Icon.Cart /></div>
        <div className="empty-title">Your cart is empty</div>
        <p className="empty-sub">Add some bold tees to get started.</p>
        <button className="empty-cta" onClick={() => nav("products")}>Shop Now</button>
      </div>
    </div>
  );
  return (
    <div className="cart-page">
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
              <div style={{ fontSize:13, color:"var(--text2)", marginTop:4 }}>₹{product.price} each</div>
            </div>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => changeQty(product.id, -1)}>−</button>
              <span className="qty-num">{qty}</span>
              <button className="qty-btn" onClick={() => changeQty(product.id, 1)}>+</button>
            </div>
            <div className="cart-row-price">₹{product.price * qty}</div>
            <button className="cart-remove-btn" onClick={() => removeFromCart(product.id)}><Icon.Trash /></button>
          </div>
        ))}
      </div>
      <div className="cart-footer">
        <div className="total-row">
          <span className="total-label">Grand Total</span>
          <span className="total-amt">₹{grandTotal}</span>
          <button className="checkout-btn" onClick={onCheckout}>CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}

// ── Wishlist Page ─────────────────────────────────────────────────────────────
function WishlistPage({ wishlist, products, nav, moveToCart, removeFromWishlist }) {
  const items = products.filter(p => wishlist.includes(p.id));
  if (items.length === 0) return (
    <div className="wishlist-page">
      <h1 className="cart-title">WISHLIST</h1>
      <div className="empty-state">
        <div className="empty-icon"><Icon.Heart filled={false} /></div>
        <div className="empty-title">No items saved</div>
        <p className="empty-sub">Heart products you love to save them here.</p>
        <button className="empty-cta" onClick={() => nav("products")}>Explore Products</button>
      </div>
    </div>
  );
  return (
    <div className="wishlist-page">
      <h1 className="cart-title">WISHLIST</h1>
      <p className="cart-sub" style={{ marginBottom:28 }}>{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
      <div className="wishlist-grid">
        {items.map(p => (
          <div className="wishlist-card" key={p.id}>
            <img src={p.image} alt={p.name} className="wishlist-img" />
            <div className="wishlist-info">
              <div className="wishlist-name">{p.name}</div>
              <div className="wishlist-price">₹{p.price}</div>
              <div className="wishlist-actions">
                <button className="wl-move-btn" onClick={() => moveToCart(p)}>Move to Cart</button>
                <button className="wl-remove-btn" onClick={() => removeFromWishlist(p.id)}>Remove</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Checkout Modal ────────────────────────────────────────────────────────────
function CheckoutModal({ cart, grandTotal, onClose, onSuccess }) {
  const [method, setMethod] = useState("card");
  const [step, setStep] = useState("form");
  const [orderId] = useState(() => "MASH" + Math.random().toString(36).substring(2,9).toUpperCase());
  const [errors, setErrors] = useState({});
  const [cardNum, setCardNum] = useState(""); const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState(""); const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState(""); const [upiApp, setUpiApp] = useState("");
  const [bank, setBank] = useState("");

  const shipping = grandTotal >= 999 ? 0 : 79;
  const finalTotal = grandTotal + shipping;

  const formatCard = v => v.replace(/\D/g,"").substring(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExpiry = v => { const d = v.replace(/\D/g,"").substring(0,4); return d.length >= 3 ? d.substring(0,2)+"/"+d.substring(2) : d; };

  const waMessage = () => {
    const lines = cart.map(({ product, qty }) => `• ${product.name} (${product.fit}) × ${qty} = ₹${product.price * qty}`);
    return `Hello MASH! 👋\nI'd like to place an order:\n\n${lines.join("\n")}\n\nShipping: ${shipping === 0 ? "FREE" : "₹" + shipping}\n*Total: ₹${finalTotal}*\n\nPlease confirm availability. Thank you! 🛍️`;
  };

  const validate = () => {
    const e = {};
    if (method === "card") {
      if (cardNum.replace(/\s/g,"").length < 16) e.cardNum = "Enter a valid 16-digit card number";
      if (!cardName.trim()) e.cardName = "Name is required";
      if (expiry.length < 5) e.expiry = "Enter valid expiry (MM/YY)";
      if (cvv.length < 3) e.cvv = "Enter valid CVV";
    }
    if (method === "upi") { if (!upiId.includes("@")) e.upiId = "Enter a valid UPI ID (e.g. name@upi)"; }
    if (method === "netbanking") { if (!bank) e.bank = "Please select a bank"; }
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

  const BANKS = [{ id:"sbi",name:"SBI",icon:"🏦" },{ id:"hdfc",name:"HDFC",icon:"🏛️" },{ id:"icici",name:"ICICI",icon:"🏧" },{ id:"axis",name:"Axis",icon:"💳" },{ id:"kotak",name:"Kotak",icon:"🏪" },{ id:"other",name:"Others",icon:"🔗" }];
  const UPI_APPS = ["GPay","PhonePe","Paytm","BHIM","Amazon Pay"];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && step !== "processing" && onClose()}>
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
            <div className="processing-sub">Please don't close this window…</div>
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
                <div className="co-summary-row" key={product.id}><span>{product.name} × {qty}</span><span>₹{product.price * qty}</span></div>
              ))}
              <div className="co-summary-row"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              <div className="co-summary-row total"><span>Total Payable</span><span>₹{finalTotal}</span></div>
            </div>
            <div className="pay-tabs">
              {[["card","💳","Card"],["upi","📱","UPI"],["netbanking","🏦","Net Banking"],["whatsapp","💬","WhatsApp"]].map(([id,icon,label]) => (
                <button key={id} className={`pay-tab ${method === id ? "active" : ""}`} onClick={() => { setMethod(id); setErrors({}); }}>
                  <span className="pay-tab-icon">{icon}</span>{label}
                </button>
              ))}
            </div>

            {method === "card" && (
              <div>
                <div className="card-visual">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div className="card-chip"><div className="card-chip-lines"><div className="card-chip-line"/><div className="card-chip-line"/><div className="card-chip-line"/></div></div>
                    <div className="card-brand">MASH PAY</div>
                  </div>
                  <div className="card-number-display">{cardNum || "•••• •••• •••• ••••"}</div>
                  <div className="card-bottom">
                    <div><div className="card-label">Card Holder</div><div className="card-value">{cardName || "CARD HOLDER"}</div></div>
                    <div><div className="card-label">Expires</div><div className="card-value">{expiry || "MM/YY"}</div></div>
                  </div>
                </div>
                <div className="card-grid">
                  <div className="form-field full"><label className="form-label">Card Number</label><input className="form-input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} maxLength={19}/>{errors.cardNum && <div className="field-error">{errors.cardNum}</div>}</div>
                  <div className="form-field full"><label className="form-label">Name on Card</label><input className="form-input" placeholder="As on card" value={cardName} onChange={e => setCardName(e.target.value.toUpperCase())}/>{errors.cardName && <div className="field-error">{errors.cardName}</div>}</div>
                  <div className="form-field"><label className="form-label">Expiry</label><input className="form-input" placeholder="MM/YY" value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5}/>{errors.expiry && <div className="field-error">{errors.expiry}</div>}</div>
                  <div className="form-field"><label className="form-label">CVV</label><input className="form-input" placeholder="•••" type="password" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,"").substring(0,4))} maxLength={4}/>{errors.cvv && <div className="field-error">{errors.cvv}</div>}</div>
                </div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "upi" && (
              <div>
                <label className="form-label" style={{ display:"block", marginBottom:8 }}>Select App (optional)</label>
                <div className="upi-logos">{UPI_APPS.map(a => <button key={a} className={`upi-logo-chip ${upiApp === a ? "sel" : ""}`} onClick={() => setUpiApp(upiApp === a ? "" : a)}>{a}</button>)}</div>
                <div className="form-field"><label className="form-label">UPI ID</label><input className="form-input" placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)}/>{errors.upiId && <div className="field-error">{errors.upiId}</div>}</div>
                <div style={{ background:"var(--bg2)", borderRadius:"var(--radius-sm)", padding:"12px 16px", fontSize:13, color:"var(--text2)" }}>💡 You'll receive a payment request on your UPI app. Approve it within 5 minutes.</div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "netbanking" && (
              <div>
                <label className="form-label" style={{ display:"block", marginBottom:12 }}>Select Your Bank</label>
                <div className="bank-grid">{BANKS.map(b => <button key={b.id} className={`bank-chip ${bank === b.id ? "sel" : ""}`} onClick={() => setBank(b.id)}><div className="bank-icon">{b.icon}</div>{b.name}</button>)}</div>
                {errors.bank && <div className="field-error">{errors.bank}</div>}
                <div style={{ background:"var(--bg2)", borderRadius:"var(--radius-sm)", padding:"12px 16px", fontSize:13, color:"var(--text2)" }}>🔒 You'll be redirected to your bank's secure portal.</div>
                <button className="pay-now-btn" onClick={handlePay}>PAY ₹{finalTotal}</button>
              </div>
            )}

            {method === "whatsapp" && (
              <div>
                <div className="whatsapp-tab-body">
                  <div style={{ fontSize:13, color:"var(--text2)", marginBottom:10, lineHeight:1.6 }}>
                    Clicking below will open WhatsApp with your complete order details pre-filled. Send it to confirm your order with MASH.
                  </div>
                  <div style={{ fontSize:12, color:"var(--text2)", marginBottom:6, fontWeight:600 }}>Preview of your message:</div>
                  <div className="wa-preview">{waMessage()}</div>
                  <div style={{ marginTop:12, fontSize:12, color:"var(--text2)" }}>📞 Order will be sent to: <strong>+91 88255 06681</strong></div>
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
