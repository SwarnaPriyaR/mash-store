import { useState, useEffect, useCallback } from "react";

// ── Product Data with fit type, quantity, base price ─────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1, name: "Phantom Wave",  price: 849,  image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80", tags: ["Graphic","Unisex"],    fit: "Regular",   qty: 20,
    description: "Cut from 100% ring-spun cotton, the Phantom Wave tee features a hand-drawn ocean motif screen-printed with water-based inks. Relaxed fit. Double-stitched hem. Available in S–3XL.",
    reviews: [{ user:"Arjun M.", rating:5, text:"Feels luxurious and fits perfectly. The print is stunning." },{ user:"Priya S.", rating:4, text:"Great quality, slightly large—order one size down." }] },
  { id: 2, name: "Urban Cipher",  price: 999,  image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", tags: ["Streetwear","Oversized"], fit: "Oversized", qty: 15,
    description: "Bold typographic print on a heavyweight 220 GSM cotton canvas. Dropped shoulders, box fit. Garment-washed for a lived-in softness straight out of the bag.",
    reviews: [{ user:"Karan P.", rating:5, text:"Absolutely love the oversized cut. Real streetwear energy." },{ user:"Sneha R.", rating:5, text:"The wash gives it such a premium feel. Already bought two." }] },
  { id: 3, name: "Minimal Arc",   price: 699,  image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80", tags: ["Minimal","Essential"],   fit: "Regular",   qty: 4,
    description: "The anti-logo tee. Clean lines, subtle tonal arc embroidery at the chest. Slim fit, mid-weight 180 GSM. Pairs with everything, competes with nothing.",
    reviews: [{ user:"Divya K.", rating:4, text:"Understated elegance. My go-to for meetings and weekends alike." }] },
  { id: 4, name: "Neon Bloom",    price: 1099, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80", tags: ["Graphic","Bold"],        fit: "Oversized", qty: 12,
    description: "Reactive-dye florals explode across a jet-black base. Limited drop. 200 GSM combed cotton. Each piece varies slightly—no two are identical.",
    reviews: [{ user:"Rahul V.", rating:5, text:"Head-turner. Got three compliments the first day I wore it." },{ user:"Ananya T.", rating:4, text:"Colours are even more vivid IRL. Very happy." }] },
  { id: 5, name: "Desert Drift",  price: 799,  image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80", tags: ["Vintage","Relaxed"],     fit: "Regular",   qty: 3,
    description: "Sun-bleached sand tones meet vintage athletic typography. Enzyme-washed for softness. Relaxed fit with ribbed crewneck and double-stitched sleeves.",
    reviews: [{ user:"Meera J.", rating:5, text:"Softest tee I own. The colour is exactly like the photo." },{ user:"Vikram N.", rating:4, text:"Vintage look nailed it. Would love more colour options." }] },
  { id: 6, name: "Grid Punk",     price: 949,  image: "https://images.unsplash.com/photo-1594938298603-c8148c4f6bfb?w=600&q=80", tags: ["Streetwear","Graphic"],  fit: "Oversized", qty: 8,
    description: "Industrial grid print with distressed edges. Screen-printed on 220 GSM cotton. Boxy cut, raw-edged sleeve hems. For those who wear their attitude.",
    reviews: [{ user:"Aarav S.", rating:5, text:"Edgy without being try-hard. Perfect weight for Chennai weather too." }] },
];

// ── API base URL (module-level so all components can use it) ─────────────────
const API_BASE = "http://localhost:3001/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const getSalePrice = (product, sale) => {
  if (!sale || !sale.active) return null;
  const now = Date.now();
  if (now >= sale.start && now <= sale.end) {
    return Math.round(product.basePrice * (1 - sale.discount / 100));
  }
  return null;
};

const convertDriveUrl = (url) => {
  if (!url) return url;
  if (url.includes("googleusercontent.com/d/")) return url;

  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idQueryRegex = /[?&]id=([a-zA-Z0-9_-]+)/;
  
  let fileId = null;
  const dMatch = url.match(fileDRegex);
  if (dMatch) {
    fileId = dMatch[1];
  } else if (url.includes("drive.google.com")) {
    const queryMatch = url.match(idQueryRegex);
    if (queryMatch) {
      fileId = queryMatch[1];
    }
  }
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return url;
};

const sendEmailNotification = async (key, msgText, toastFn) => {
  if (!key) return;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        access_key: key,
        subject: "🚨 MASH Store Inventory Alert Report",
        from_name: "MASH Store Inventory System",
        message: `Dear Admin,

Here is the latest inventory stock alert report from MASH Store:

${msgText}

Best regards,
MASH Inventory Bot`
      })
    });
    const data = await res.json();
    if (data.success) {
      toastFn("📧 Real stock alert email dispatched successfully!");
    } else {
      toastFn("⚠️ Web3Forms failed to deliver email: " + (data.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Email delivery failed", err);
    toastFn("❌ Network error: Could not send stock alert email");
  }
};

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Sun: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>),
  Moon: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>),
  Heart: ({ filled }) => (<svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>),
  Cart: () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>),
  Star: ({ filled }) => (<svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#f59e0b" : "none"} stroke="#f59e0b" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>),
  Trash: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>),
  ArrowLeft: () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>),
  Shirt: () => (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.86H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.86l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>),
  Shield: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
  Bell: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>),
  Tag: () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>),
};

// ── Styles ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:#f5f0e8; --bg2:#ebe5d8; --surface:#ffffff; --border:#d4ccc0;
    --text:#1a1714; --text2:#6b6258; --accent:#c84b2f; --accent2:#e8603e;
    --green:#16a34a; --orange:#ea580c; --tag-bg:#1a1714; --tag-text:#f5f0e8;
    --nav-bg:rgba(245,240,232,0.92);
    --shadow:0 4px 24px rgba(26,23,20,0.08); --shadow-lg:0 8px 40px rgba(26,23,20,0.14);
    --radius:12px; --radius-sm:8px;
  }
  .dark {
    --bg:#131110; --bg2:#1e1b19; --surface:#252220; --border:#3a3530;
    --text:#f0ebe3; --text2:#9e9288; --accent:#e8603e; --accent2:#ff7a55;
    --tag-bg:#f0ebe3; --tag-text:#131110; --nav-bg:rgba(19,17,16,0.92);
    --shadow:0 4px 24px rgba(0,0,0,0.32); --shadow-lg:0 8px 40px rgba(0,0,0,0.44);
  }
  body { background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; }
  ::-webkit-scrollbar { width:6px; } ::-webkit-scrollbar-track { background:var(--bg2); } ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }

  /* NAV */
  .nav { position:fixed; top:0; left:0; right:0; z-index:100; background:var(--nav-bg); backdrop-filter:blur(12px); border-bottom:1px solid var(--border); padding:0 32px; height:64px; display:flex; align-items:center; justify-content:space-between; }
  .nav-logo { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.08em; color:var(--text); cursor:pointer; display:flex; align-items:center; gap:8px; transition:color 0.2s; }
  .nav-logo:hover { color:var(--accent); }
  .nav-right { display:flex; align-items:center; gap:6px; }
  .icon-btn { width:40px; height:40px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center; position:relative; transition:all 0.2s; }
  .icon-btn:hover { background:var(--bg2); color:var(--accent); border-color:var(--accent); }
  .badge { position:absolute; top:-6px; right:-6px; width:18px; height:18px; border-radius:99px; background:var(--accent); color:#fff; font-size:10px; font-weight:600; display:flex; align-items:center; justify-content:center; border:2px solid var(--bg); pointer-events:none; }
  .auth-btn { height:36px; padding:0 16px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; font-size:13px; font-weight:500; font-family:'DM Sans',sans-serif; transition:all 0.2s; white-space:nowrap; }
  .auth-btn:hover { background:var(--text); color:var(--bg); border-color:var(--text); }
  .auth-btn.primary { background:var(--accent); color:#fff; border-color:var(--accent); }
  .auth-btn.primary:hover { background:var(--accent2); border-color:var(--accent2); }
  .admin-btn { height:36px; padding:0 14px; border-radius:var(--radius-sm); border:1px solid #7c3aed; background:#7c3aed; color:#fff; cursor:pointer; font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.2s; display:flex; align-items:center; gap:5px; white-space:nowrap; }
  .admin-btn:hover { background:#6d28d9; }

  /* PAGE */
  .page { padding-top:64px; min-height:100vh; }

  /* HERO */
  .hero { min-height:calc(100vh - 64px); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:48px 24px; background:var(--bg); position:relative; overflow:hidden; }
  .hero-bg-text { position:absolute; top:50%; left:50%; transform:translate(-50%,-52%); font-family:'Bebas Neue',sans-serif; font-size:clamp(120px,22vw,280px); color:var(--bg2); letter-spacing:0.04em; user-select:none; pointer-events:none; white-space:nowrap; z-index:0; }
  .hero-content { position:relative; z-index:1; }
  .hero-eyebrow { display:inline-flex; align-items:center; gap:8px; background:var(--tag-bg); color:var(--tag-text); padding:5px 14px; border-radius:99px; font-size:12px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:24px; }
  .hero-title { font-family:'Bebas Neue',sans-serif; font-size:clamp(64px,12vw,140px); line-height:0.92; letter-spacing:0.02em; color:var(--text); margin-bottom:24px; }
  .hero-title span { color:var(--accent); }
  .hero-sub { font-size:clamp(15px,2vw,18px); color:var(--text2); max-width:480px; margin:0 auto 40px; line-height:1.6; }
  .cta-btn { display:inline-flex; align-items:center; gap:10px; background:var(--accent); color:#fff; padding:16px 36px; border-radius:var(--radius-sm); font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:0.1em; cursor:pointer; border:none; transition:all 0.25s; box-shadow:0 4px 20px rgba(200,75,47,0.35); }
  .cta-btn:hover { background:var(--accent2); transform:translateY(-2px); }
  .hero-strips { display:flex; gap:12px; margin-top:64px; justify-content:center; flex-wrap:wrap; }
  .strip { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:12px 20px; font-size:13px; color:var(--text2); font-weight:500; display:flex; align-items:center; gap:8px; }
  .strip-dot { width:8px; height:8px; border-radius:99px; background:var(--accent); }

  /* SALE BANNER */
  .sale-banner { background:linear-gradient(90deg,var(--accent),var(--accent2)); color:#fff; text-align:center; padding:10px 24px; font-size:13px; font-weight:600; letter-spacing:0.05em; display:flex; align-items:center; justify-content:center; gap:10px; }
  .sale-timer { background:rgba(0,0,0,0.25); padding:3px 10px; border-radius:99px; font-family:'Bebas Neue',sans-serif; font-size:15px; letter-spacing:0.08em; }

  /* PRODUCTS */
  .products-page { background:var(--bg); padding:32px; }
  .products-header { margin-bottom:24px; }
  .products-title { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:0.04em; color:var(--text); }
  .products-sub { color:var(--text2); font-size:15px; margin-top:4px; }

  /* FIT FILTER */
  .fit-filter { display:flex; gap:8px; margin-bottom:28px; flex-wrap:wrap; }
  .fit-chip { padding:8px 18px; border-radius:99px; border:1.5px solid var(--border); background:var(--surface); color:var(--text2); font-size:13px; font-weight:600; cursor:pointer; transition:all 0.18s; }
  .fit-chip:hover { border-color:var(--accent); color:var(--accent); }
  .fit-chip.active { background:var(--accent); border-color:var(--accent); color:#fff; }

  .product-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:24px; }
  .product-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; cursor:pointer; transition:all 0.25s; display:flex; flex-direction:column; }
  .product-card:hover { transform:translateY(-4px); box-shadow:var(--shadow-lg); border-color:var(--accent); }
  .product-card.oos { opacity:0.55; pointer-events:none; }
  .product-img-wrap { position:relative; aspect-ratio:4/5; overflow:hidden; background:var(--bg2); }
  .product-img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s ease; display:block; }
  .product-card:hover .product-img { transform:scale(1.05); }
  .product-tags { position:absolute; top:12px; left:12px; display:flex; gap:6px; flex-wrap:wrap; }
  .product-tag { background:var(--tag-bg); color:var(--tag-text); font-size:10px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; padding:3px 8px; border-radius:4px; }
  .sale-tag { background:var(--accent); color:#fff; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:3px 8px; border-radius:4px; }
  .oos-tag { background:#6b7280; color:#fff; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:3px 8px; border-radius:4px; }
  .qty-tag { position:absolute; bottom:10px; left:12px; background:rgba(0,0,0,0.65); color:#fff; font-size:11px; font-weight:600; padding:3px 9px; border-radius:99px; }
  .product-info { padding:16px 20px 20px; flex:1; display:flex; flex-direction:column; justify-content:space-between; }
  .product-name { font-weight:600; font-size:17px; color:var(--text); margin-bottom:4px; }
  .price-row { display:flex; align-items:baseline; gap:8px; }
  .product-price { font-family:'Bebas Neue',sans-serif; font-size:22px; color:var(--accent); letter-spacing:0.04em; }
  .product-price-orig { font-family:'Bebas Neue',sans-serif; font-size:16px; color:var(--text2); letter-spacing:0.04em; text-decoration:line-through; }
  .product-price-prefix { font-family:'DM Sans',sans-serif; font-size:13px; color:var(--text2); font-weight:400; }

  /* DETAIL */
  .detail-page { background:var(--bg); padding:40px 32px; max-width:1100px; margin:0 auto; }
  .detail-back { display:inline-flex; align-items:center; gap:8px; color:var(--text2); font-size:13px; font-weight:500; cursor:pointer; margin-bottom:32px; background:none; border:none; font-family:'DM Sans',sans-serif; transition:color 0.2s; padding:0; }
  .detail-back:hover { color:var(--accent); }
  .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:48px; }
  .detail-img-wrap { aspect-ratio:4/5; border-radius:var(--radius); overflow:hidden; background:var(--bg2); border:1px solid var(--border); position:relative; }
  .detail-img { width:100%; height:100%; object-fit:cover; display:block; }
  .detail-info { display:flex; flex-direction:column; gap:20px; }
  .detail-tags { display:flex; gap:8px; flex-wrap:wrap; }
  .detail-name { font-family:'Bebas Neue',sans-serif; font-size:52px; line-height:1; color:var(--text); letter-spacing:0.02em; }
  .detail-price-row { display:flex; align-items:baseline; gap:10px; }
  .detail-price { font-family:'Bebas Neue',sans-serif; font-size:36px; color:var(--accent); letter-spacing:0.04em; }
  .detail-price-orig { font-family:'Bebas Neue',sans-serif; font-size:24px; color:var(--text2); text-decoration:line-through; }
  .detail-desc { color:var(--text2); font-size:15px; line-height:1.7; }
  .detail-actions { display:flex; gap:12px; }
  .btn-primary { flex:1; padding:14px 20px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; transition:all 0.2s; }
  .btn-primary:hover { background:var(--accent2); transform:translateY(-1px); }
  .btn-primary:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
  .btn-secondary { flex:1; padding:14px 20px; border-radius:var(--radius-sm); background:var(--surface); color:var(--text); border:1.5px solid var(--border); cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; transition:all 0.2s; }
  .btn-secondary:hover { border-color:var(--accent); color:var(--accent); }
  .btn-secondary.wishlisted { border-color:var(--accent); color:var(--accent); }
  .divider { border:none; border-top:1px solid var(--border); }
  .stock-info { font-size:13px; font-weight:600; }
  .stock-ok { color:var(--green); } .stock-low { color:var(--orange); } .stock-out { color:#dc2626; }
  .reviews-section { margin-top:48px; }
  .reviews-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.04em; margin-bottom:20px; }
  .review-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px 20px; margin-bottom:12px; }
  .review-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
  .review-user { font-weight:600; font-size:14px; }
  .review-stars { display:flex; gap:2px; }
  .review-text { color:var(--text2); font-size:14px; line-height:1.6; }

  /* CART */
  .cart-page { background:var(--bg); padding:40px 32px; max-width:960px; margin:0 auto; }
  .cart-title { font-family:'Bebas Neue',sans-serif; font-size:52px; letter-spacing:0.04em; margin-bottom:8px; }
  .cart-sub { color:var(--text2); font-size:14px; margin-bottom:32px; }
  .cart-table { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; }
  .cart-head { display:grid; grid-template-columns:80px 1fr 120px 120px 48px; background:var(--bg2); border-bottom:1px solid var(--border); padding:12px 20px; gap:16px; align-items:center; }
  .cart-head-label { font-size:11px; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--text2); }
  .cart-row { display:grid; grid-template-columns:80px 1fr 120px 120px 48px; padding:16px 20px; gap:16px; align-items:center; border-bottom:1px solid var(--border); transition:background 0.15s; }
  .cart-row:last-child { border-bottom:none; }
  .cart-row:hover { background:var(--bg2); }
  .cart-row-img { width:64px; height:72px; object-fit:cover; border-radius:var(--radius-sm); border:1px solid var(--border); display:block; }
  .cart-row-name { font-weight:600; font-size:15px; }
  .qty-control { display:flex; align-items:center; gap:8px; }
  .qty-btn { width:28px; height:28px; border-radius:6px; border:1px solid var(--border); background:var(--bg); color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:500; transition:all 0.15s; }
  .qty-btn:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
  .qty-num { font-weight:600; font-size:15px; min-width:24px; text-align:center; }
  .cart-row-price { font-family:'Bebas Neue',sans-serif; font-size:20px; color:var(--text); letter-spacing:0.04em; }
  .cart-remove-btn { width:32px; height:32px; border-radius:6px; border:1px solid var(--border); background:none; color:var(--text2); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .cart-remove-btn:hover { background:#fee2e2; color:#dc2626; border-color:#dc2626; }
  .cart-footer { display:flex; justify-content:flex-end; margin-top:24px; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px 24px; }
  .total-row { display:flex; align-items:center; gap:24px; }
  .total-label { font-size:15px; font-weight:500; color:var(--text2); }
  .total-amt { font-family:'Bebas Neue',sans-serif; font-size:36px; color:var(--accent); letter-spacing:0.04em; }
  .checkout-btn { margin-left:32px; padding:14px 32px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:0.1em; transition:all 0.2s; }
  .checkout-btn:hover { background:var(--accent2); transform:translateY(-1px); }
  .empty-state { text-align:center; padding:80px 24px; display:flex; flex-direction:column; align-items:center; gap:16px; }
  .empty-icon { color:var(--border); }
  .empty-title { font-family:'Bebas Neue',sans-serif; font-size:32px; color:var(--text2); letter-spacing:0.04em; }
  .empty-sub { color:var(--text2); font-size:14px; }
  .empty-cta { margin-top:8px; padding:12px 28px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; transition:all 0.2s; }
  .empty-cta:hover { background:var(--accent2); }

  /* WISHLIST */
  .wishlist-page { background:var(--bg); padding:40px 32px; max-width:960px; margin:0 auto; }
  .wishlist-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:20px; }
  .wishlist-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); overflow:hidden; transition:all 0.2s; }
  .wishlist-card:hover { box-shadow:var(--shadow-lg); transform:translateY(-2px); }
  .wishlist-img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; }
  .wishlist-info { padding:16px; }
  .wishlist-name { font-weight:600; font-size:16px; margin-bottom:4px; }
  .wishlist-price { font-family:'Bebas Neue',sans-serif; font-size:22px; color:var(--accent); margin-bottom:14px; }
  .wishlist-actions { display:flex; gap:8px; }
  .wl-move-btn { flex:1; padding:10px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .wl-move-btn:hover { background:var(--accent2); }
  .wl-remove-btn { flex:1; padding:10px; border-radius:var(--radius-sm); background:var(--bg); color:var(--text2); border:1px solid var(--border); cursor:pointer; font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
  .wl-remove-btn:hover { border-color:#dc2626; color:#dc2626; }

  /* MODAL BASE */
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:999; padding:24px; }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:40px; width:100%; max-width:420px; position:relative; box-shadow:var(--shadow-lg); animation:modalIn 0.2s ease; }
  @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:none; } }
  .modal-close { position:absolute; top:16px; right:16px; width:32px; height:32px; border:1px solid var(--border); border-radius:6px; background:none; color:var(--text2); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; transition:all 0.15s; }
  .modal-close:hover { background:var(--bg2); color:var(--text); }
  .modal-title { font-family:'Bebas Neue',sans-serif; font-size:34px; margin-bottom:6px; letter-spacing:0.04em; }
  .modal-sub { color:var(--text2); font-size:14px; margin-bottom:28px; }
  .form-field { margin-bottom:16px; }
  .form-label { display:block; font-size:12px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--text2); margin-bottom:6px; }
  .form-input { width:100%; padding:11px 14px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s; }
  .form-input:focus { border-color:var(--accent); }
  .modal-submit { width:100%; padding:14px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:0.1em; margin-top:8px; transition:background 0.2s; }
  .modal-submit:hover { background:var(--accent2); }
  .modal-switch { text-align:center; margin-top:16px; font-size:13px; color:var(--text2); }
  .modal-switch button { background:none; border:none; color:var(--accent); cursor:pointer; font-weight:600; font-size:13px; text-decoration:underline; }

  /* CHECKOUT MODAL */
  .checkout-modal { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); width:100%; max-width:580px; position:relative; box-shadow:var(--shadow-lg); animation:modalIn 0.22s ease; max-height:92vh; overflow-y:auto; }
  .co-header { padding:24px 32px 18px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; background:var(--surface); z-index:2; }
  .co-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.05em; }
  .co-body { padding:24px 32px 32px; }
  .co-summary { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px 18px; margin-bottom:24px; display:flex; flex-direction:column; gap:6px; }
  .co-summary-row { display:flex; justify-content:space-between; font-size:13px; color:var(--text2); }
  .co-summary-row.total { color:var(--text); font-weight:700; font-size:15px; border-top:1px solid var(--border); padding-top:8px; margin-top:2px; }
  .co-summary-row.total span:last-child { font-family:'Bebas Neue',sans-serif; font-size:20px; color:var(--accent); }
  .pay-tabs { display:flex; gap:8px; margin-bottom:24px; flex-wrap:wrap; }
  .pay-tab { flex:1; min-width:100px; padding:10px 6px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--bg); cursor:pointer; transition:all 0.18s; text-align:center; font-family:'DM Sans',sans-serif; color:var(--text2); font-size:12px; font-weight:600; display:flex; flex-direction:column; align-items:center; gap:5px; }
  .pay-tab:hover { border-color:var(--accent); color:var(--text); }
  .pay-tab.active { border-color:var(--accent); background:var(--surface); color:var(--accent); box-shadow:0 0 0 3px rgba(200,75,47,0.1); }
  .pay-tab-icon { font-size:20px; }
  .card-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .card-grid .full { grid-column:1/-1; }
  .card-visual { background:linear-gradient(135deg,#1a1714 0%,#3a2e28 50%,#c84b2f 100%); border-radius:14px; padding:20px 24px; margin-bottom:20px; position:relative; overflow:hidden; min-height:160px; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 8px 32px rgba(200,75,47,0.25); }
  .card-visual::before { content:''; position:absolute; top:-40px; right:-40px; width:200px; height:200px; border-radius:50%; background:rgba(255,255,255,0.05); }
  .card-chip { width:38px; height:28px; background:#d4a847; border-radius:5px; display:flex; align-items:center; justify-content:center; }
  .card-chip-lines { display:grid; grid-template-rows:1fr 1fr 1fr; gap:3px; width:22px; }
  .card-chip-line { height:3px; background:rgba(0,0,0,0.35); border-radius:2px; }
  .card-number-display { font-family:'Courier New',monospace; font-size:18px; color:#fff; letter-spacing:0.18em; font-weight:500; }
  .card-bottom { display:flex; justify-content:space-between; align-items:flex-end; }
  .card-label { font-size:9px; color:rgba(255,255,255,0.55); text-transform:uppercase; letter-spacing:0.1em; margin-bottom:2px; }
  .card-value { font-size:13px; color:rgba(255,255,255,0.9); font-weight:500; }
  .card-brand { font-family:'Bebas Neue',sans-serif; font-size:22px; color:rgba(255,255,255,0.9); letter-spacing:0.1em; }
  .upi-logos { display:flex; gap:10px; margin-bottom:18px; flex-wrap:wrap; }
  .upi-logo-chip { padding:8px 16px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--bg); font-size:13px; font-weight:700; color:var(--text2); cursor:pointer; transition:all 0.15s; }
  .upi-logo-chip:hover,.upi-logo-chip.sel { border-color:var(--accent); color:var(--accent); background:var(--surface); }
  .bank-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-bottom:18px; }
  .bank-chip { padding:12px 8px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--bg); font-size:12px; font-weight:600; color:var(--text2); cursor:pointer; transition:all 0.15s; text-align:center; }
  .bank-chip:hover,.bank-chip.sel { border-color:var(--accent); color:var(--accent); background:var(--surface); }
  .bank-icon { font-size:20px; margin-bottom:4px; }
  .whatsapp-tab-body { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px; }
  .wa-preview { background:#075e54; border-radius:var(--radius-sm); padding:14px 18px; margin-top:14px; font-size:12px; color:#e8f5e9; line-height:1.7; white-space:pre-line; font-family:'Courier New',monospace; max-height:160px; overflow-y:auto; }
  .pay-now-btn { width:100%; padding:16px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.1em; margin-top:24px; transition:all 0.2s; }
  .pay-now-btn:hover:not(:disabled) { background:var(--accent2); transform:translateY(-1px); }
  .pay-now-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .wa-send-btn { width:100%; padding:16px; border-radius:var(--radius-sm); background:#25d366; color:#fff; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:22px; letter-spacing:0.1em; margin-top:24px; transition:all 0.2s; }
  .wa-send-btn:hover { background:#128c7e; }
  .processing-wrap { text-align:center; padding:48px 24px; display:flex; flex-direction:column; align-items:center; gap:20px; }
  .spinner { width:56px; height:56px; border-radius:50%; border:4px solid var(--border); border-top-color:var(--accent); animation:spin 0.8s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .processing-title { font-family:'Bebas Neue',sans-serif; font-size:28px; letter-spacing:0.05em; }
  .processing-sub { color:var(--text2); font-size:14px; }
  .success-wrap { text-align:center; padding:48px 32px; display:flex; flex-direction:column; align-items:center; gap:16px; }
  .success-icon { width:72px; height:72px; border-radius:50%; background:#dcfce7; display:flex; align-items:center; justify-content:center; animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1); font-size:32px; }
  @keyframes popIn { from { transform:scale(0); opacity:0; } to { transform:scale(1); opacity:1; } }
  .success-title { font-family:'Bebas Neue',sans-serif; font-size:36px; letter-spacing:0.04em; }
  .success-sub { color:var(--text2); font-size:14px; line-height:1.6; max-width:300px; }
  .order-id { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 20px; font-size:13px; color:var(--text2); }
  .order-id span { font-weight:700; color:var(--text); }
  .success-cta { margin-top:8px; padding:13px 32px; border-radius:var(--radius-sm); background:var(--accent); color:#fff; border:none; cursor:pointer; font-family:'Bebas Neue',sans-serif; font-size:18px; letter-spacing:0.1em; transition:background 0.2s; }
  .success-cta:hover { background:var(--accent2); }
  .secure-badge { display:flex; align-items:center; justify-content:center; gap:6px; color:var(--text2); font-size:12px; margin-top:12px; }
  .field-error { color:#dc2626; font-size:11px; margin-top:4px; }

  /* ADMIN */
  .admin-page { background:var(--bg); padding:40px 32px; max-width:1100px; margin:0 auto; }
  .admin-title { font-family:'Bebas Neue',sans-serif; font-size:48px; letter-spacing:0.04em; margin-bottom:4px; }
  .admin-sub { color:var(--text2); font-size:14px; margin-bottom:32px; }
  .admin-tabs { display:flex; gap:8px; margin-bottom:32px; border-bottom:2px solid var(--border); }
  .admin-tab { padding:10px 22px; border:none; background:none; color:var(--text2); font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; transition:all 0.18s; }
  .admin-tab.active { color:var(--accent); border-bottom-color:var(--accent); }
  .admin-tab:hover { color:var(--text); }
  .admin-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; margin-bottom:20px; }
  .admin-card-title { font-family:'Bebas Neue',sans-serif; font-size:20px; letter-spacing:0.04em; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .admin-row { display:grid; grid-template-columns:60px 1fr repeat(4,120px) 48px; gap:12px; align-items:center; padding:12px 16px; border-bottom:1px solid var(--border); }
  .admin-row:last-child { border-bottom:none; }
  .admin-row:hover { background:var(--bg2); border-radius:var(--radius-sm); }
  .admin-thumb { width:48px; height:54px; object-fit:cover; border-radius:6px; border:1px solid var(--border); }
  .admin-name { font-weight:600; font-size:14px; }
  .admin-id { font-size:11px; color:var(--text2); }
  .admin-qty-badge { display:inline-flex; align-items:center; justify-content:center; padding:3px 10px; border-radius:99px; font-size:12px; font-weight:700; }
  .qty-ok { background:#dcfce7; color:#15803d; }
  .qty-low { background:#fef9c3; color:#a16207; }
  .qty-out { background:#fee2e2; color:#dc2626; }
  .admin-input { padding:7px 10px; border-radius:var(--radius-sm); border:1.5px solid var(--border); background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; width:100%; outline:none; transition:border-color 0.2s; }
  .admin-input:focus { border-color:var(--accent); }
  .admin-action-btn { padding:7px 12px; border-radius:var(--radius-sm); border:1px solid var(--border); background:var(--surface); color:var(--text); font-size:12px; font-weight:600; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .admin-action-btn:hover { background:var(--accent); color:#fff; border-color:var(--accent); }
  .admin-del-btn { padding:7px; border-radius:var(--radius-sm); border:1px solid var(--border); background:none; color:var(--text2); cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
  .admin-del-btn:hover { background:#fee2e2; color:#dc2626; border-color:#dc2626; }
  .alert-banner { background:#fef3c7; border:1px solid #fbbf24; border-radius:var(--radius-sm); padding:14px 18px; display:flex; align-items:flex-start; gap:10px; margin-bottom:16px; }
  .alert-icon { font-size:18px; flex-shrink:0; margin-top:1px; }
  .alert-text { font-size:13px; color:#92400e; line-height:1.5; }
  .alert-text strong { font-weight:700; }
  .sale-form { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  .sale-form .full { grid-column:1/-1; }
  .sale-active-badge { display:inline-flex; align-items:center; gap:6px; background:#dcfce7; color:#15803d; padding:4px 12px; border-radius:99px; font-size:12px; font-weight:700; }
  .sale-inactive-badge { display:inline-flex; align-items:center; gap:6px; background:var(--bg2); color:var(--text2); padding:4px 12px; border-radius:99px; font-size:12px; font-weight:600; }
  .notify-log { background:var(--bg2); border:1px solid var(--border); border-radius:var(--radius-sm); padding:14px 18px; max-height:180px; overflow-y:auto; }
  .notify-item { font-size:12px; color:var(--text2); border-bottom:1px solid var(--border); padding:6px 0; display:flex; gap:10px; }
  .notify-item:last-child { border-bottom:none; }
  .notify-time { color:var(--accent); font-weight:600; white-space:nowrap; }
  .admin-stat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:16px; margin-bottom:24px; }
  .admin-stat { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px 20px; }
  .admin-stat-label { font-size:11px; font-weight:600; letter-spacing:0.08em; text-transform:uppercase; color:var(--text2); margin-bottom:6px; }
  .admin-stat-val { font-family:'Bebas Neue',sans-serif; font-size:30px; color:var(--text); letter-spacing:0.04em; }
  .admin-stat-val.warn { color:var(--orange); }
  .admin-stat-val.danger { color:#dc2626; }

  /* TOAST */
  .toast-wrap { position:fixed; bottom:28px; right:28px; z-index:9999; display:flex; flex-direction:column; gap:8px; pointer-events:none; }
  .toast { background:var(--text); color:var(--bg); padding:12px 20px; border-radius:var(--radius-sm); font-size:13px; font-weight:500; box-shadow:var(--shadow-lg); animation:toastIn 0.25s ease; max-width:300px; }
  @keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }

  @media(max-width:720px) { .detail-grid { grid-template-columns:1fr; } .admin-row { grid-template-columns:48px 1fr 80px 48px; } }
  @media(max-width:600px) { .nav { padding:0 16px; } .products-page,.detail-page,.cart-page,.wishlist-page,.admin-page { padding:24px 16px; } .cart-head { display:none; } .cart-row { grid-template-columns:64px 1fr 48px; } }

  /* ADMIN PORTAL */
  .admin-portal-layout { display: flex; min-height: 100vh; background: var(--bg); }
  .admin-sidebar { width: 260px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; justify-content: space-between; position: fixed; top: 0; bottom: 0; left: 0; z-index: 10; }
  .admin-sidebar-top { padding: 24px; }
  .admin-sidebar-logo { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 0.08em; display: flex; align-items: center; gap: 8px; color: var(--text); margin-bottom: 32px; cursor: pointer; }
  .admin-sidebar-menu { display: flex; flex-direction: column; gap: 4px; list-style: none; }
  .admin-sidebar-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: none; border: none; border-radius: var(--radius-sm); color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.2s; }
  .admin-sidebar-btn:hover { background: rgba(0,0,0,0.04); color: var(--text); }
  .dark .admin-sidebar-btn:hover { background: rgba(255,255,255,0.04); color: var(--text); }
  .admin-sidebar-btn.active { background: var(--accent); color: #fff; font-weight: 600; }
  .admin-sidebar-btn.active:hover { background: var(--accent); color: #fff; }
  .admin-sidebar-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; }
  
  .admin-main-content { flex: 1; margin-left: 260px; padding: 40px; min-height: 100vh; overflow-y: auto; }
  .admin-page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }
  .admin-page-title-group { display: flex; flex-direction: column; gap: 4px; }
  
  /* STATS CARDS */
  .admin-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
  .admin-stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 8px; box-shadow: var(--shadow); position: relative; overflow: hidden; }
  .admin-stat-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--border); }
  .admin-stat-card.accent::after { background: var(--accent); }
  .admin-stat-card.green::after { background: var(--green); }
  .admin-stat-card.orange::after { background: var(--orange); }
  .admin-stat-card.purple::after { background: #7c3aed; }
  
  .admin-stat-title { font-size: 11px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text2); }
  .admin-stat-number { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--text); letter-spacing: 0.04em; }
  .admin-stat-desc { font-size: 12px; color: var(--text2); margin-top: auto; }
  
  /* LOGIN CARD */
  .admin-login-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #131110; padding: 24px; }
  .admin-login-card { width: 100%; max-width: 400px; background: #252220; border: 1px solid #3a3530; border-radius: var(--radius); padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); text-align: center; }
  .admin-login-logo { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #f0ebe3; letter-spacing: 0.08em; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; }
  .admin-login-title { font-size: 16px; font-weight: 500; color: var(--accent); letter-spacing: 0.05em; margin-bottom: 32px; text-transform: uppercase; }
  
  /* EXPANDABLE PRODUCT FORM */
  .admin-form-header { display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 15px; margin-bottom: 20px; transition: all 0.2s; }
  .admin-form-header:hover { border-color: var(--accent); }
  .admin-form-body { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 24px; margin-bottom: 24px; border-top: none; margin-top: -20px; animation: slideDown 0.25s ease-out; }
  @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  
  .img-pick-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 8px; }
  .img-pick-thumb { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: var(--radius-sm); border: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
  .img-pick-thumb:hover { border-color: var(--border); transform: scale(1.03); }
  .img-pick-thumb.selected { border-color: var(--accent); transform: scale(1.05); }
  
  .schedule-type-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
  .schedule-type-tab { flex: 1; padding: 10px; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; color: var(--text2); cursor: pointer; text-align: center; transition: all 0.2s; }
  .schedule-type-tab:hover { color: var(--text); border-color: var(--accent); }
  .schedule-type-tab.active { background: var(--surface); border-color: var(--accent); color: var(--accent); }
`;

// ── Toast hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  return { toasts, add };
}

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(endTime) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return remaining > 0 ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : null;
}

// ── Hash routing hook ─────────────────────────────────────────────────────────
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  return hash;
}

// ── Main App ──────────────────────────────────────────────────────────────────
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
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        // Normalize: add runtime `price` field (= basePrice, adjusted by sale later)
        setProducts(data.map(p => ({ ...p, price: p.basePrice, image: convertDriveUrl(p.image), reviews: p.reviews || [] })));
      } catch (err) {
        console.error("Failed to load products from API:", err);
        setProductsError("Could not connect to MASH Store API. Make sure the server is running on port 3001.");
        // Fallback to initial data so storefront still works
        setProducts(INITIAL_PRODUCTS.map(p => ({ ...p, basePrice: p.price, image: convertDriveUrl(p.image) })));
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

  // Simulated stock-check job (runs at mount to demo; in real app: cron at 9AM & 6PM IST)
  useEffect(() => {
    const runStockCheck = () => {
      const low = products.filter(p => p.qty < 5 && p.qty > 0);
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
    
    const msTo9AM = (() => {
      const now = new Date();
      const target = new Date(now);
      target.setHours(9, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return target - now;
    })();
    const t1 = setTimeout(() => { runStockCheck(); setInterval(runStockCheck, 86400000); }, msTo9AM);
    return () => clearTimeout(t1);
  }, []);

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
        <style>{STYLES}</style>
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
        />
        {/* TOASTS */}
        <div className="toast-wrap">{toasts.map(t => <div key={t.id} className="toast">{t.msg}</div>)}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{STYLES}</style>

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
          {isLocal && (
            <button className="admin-btn" onClick={() => window.open("#/admin", "_blank")} title="Admin Portal">
              <Icon.Shield /> Admin Portal
            </button>
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

function AdminPortal({ products, setProducts, sale, setSale, notifyLog, setNotifyLog, toast, dark, setDark, emailEnabled, setEmailEnabled, web3FormsKey, setWeb3FormsKey }) {
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
    mode: "scheduled" // "instant" or "scheduled"
  });

  const [editValues, setEditValues] = useState({});

  const templates = [
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80"
  ];

  if (!authed) {
    const handleLoginSubmit = () => {
      if (adminPass === "mash@admin") {
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
          <p style={{ marginTop: "24px", fontSize: "12px", color: "#6b6258" }}>
            Demo Key: <strong style={{ color: "#9e9288" }}>mash@admin</strong>
          </p>
        </div>
      </div>
    );
  }

  const lowStock = products.filter(p => p.qty > 0 && p.qty < 5);
  const outStock = products.filter(p => p.qty === 0);
  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isSaleScheduled = !isSaleActive && sale.startTime && Date.now() < sale.startTime;

  // ── API helpers ─────────────────────────────────────────────────────────────

  // Re-fetch products from Neon and refresh local state
  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/products`);
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
  }, [isSaleActive, sale.discount]);

  // PATCH — update a single field (qty, basePrice, or fit) for a product
  const updateProduct = useCallback(async (id, field, value) => {
    // Optimistic UI update first
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
      // Map field name: "basePrice" in UI → send as basePrice to API
      const body = {};
      if (field === "qty") body.qty = parseInt(value);
      else if (field === "basePrice") body.basePrice = parseInt(value);
      else body[field] = value;

      const res = await fetch(`${API_BASE}/products/${id}`, {
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
      // Revert by re-fetching
      await refreshProducts();
    }
  }, [isSaleActive, sale.discount, refreshProducts, toast]);

  // DELETE — remove a product permanently from Neon
  const removeProduct = useCallback(async (id) => {
    const product = products.find(p => p.id === id);
    // Optimistic remove
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
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
  }, [products, refreshProducts, toast]);

  // POST — add a new product to Neon
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
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Server error ${res.status}`);
      }
      const created = await res.json();

      // Add to local state immediately (with price field)
      const finalPrice = isSaleActive ? Math.round(created.basePrice * (1 - sale.discount / 100)) : created.basePrice;
      setProducts(prev => [...prev, { ...created, price: finalPrice, image: convertDriveUrl(created.image), reviews: [] }]);

      // Reset form
      setNewProd({ name: "", price: "", qty: "", fit: "Regular", image: "", tags: "Graphic, Unisex", description: "Premium heavy cotton streetwear tee." });
      setSelectedImgTemplate("");
      setExpandAddForm(false);

      // Log entry
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
  }, [newProd, isSaleActive, sale.discount, templates, toast]);

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
    const low = products.filter(p => p.qty < 5 && p.qty > 0);
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
    toast("📧 Stock check run — email sent to swarnapriya.kr@gmail.com");
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
          <button className="admin-sidebar-btn" onClick={() => window.open(isLocal ? "http://localhost:5173" : "https://mashstore.in", "_blank")} style={{ border: "1px solid var(--border)" }}>
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

            {/* Neon DB connection status */}
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

            {/* DB loading / error state */}
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

            {/* PRODUCT LIST */}
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
                  <span className={`admin-qty-badge ${p.qty === 0 ? "qty-out" : p.qty < 5 ? "qty-low" : "qty-ok"}`}>
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
                Automatic stock check emails are run periodically twice daily at <strong>9:00 AM IST</strong> and <strong>6:00 PM IST</strong>. Any product dropping below 5 units automatically reports an alert to the console and generates logs.
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>📧</span> swarnapriya.kr@gmail.com
                </div>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "10px 16px", fontSize: 13, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>⏰</span> 9:00 AM & 6:00 PM IST
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

// ── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ mode, onClose, onLogin, switchMode }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const submit = () => {
    if (mode === "login") { if (!email || !pass) return; onLogin(email.split("@")[0]); }
    else { if (!name || !email || !pass) return; onLogin(name); }
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">{mode === "login" ? "WELCOME BACK" : "JOIN MASH"}</h2>
        <p className="modal-sub">{mode === "login" ? "Log in to your account" : "Create your free account"}</p>
        {mode === "signup" && <div className="form-field"><label className="form-label">Name</label><input className="form-input" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>}
        <div className="form-field"><label className="form-label">Email</label><input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="form-field"><label className="form-label">Password</label><input className="form-input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} /></div>
        <button className="modal-submit" onClick={submit}>{mode === "login" ? "LOG IN" : "CREATE ACCOUNT"}</button>
        <div className="modal-switch">
          {mode === "login" ? <>Don't have an account? <button onClick={() => switchMode("signup")}>Sign up</button></> : <>Already have an account? <button onClick={() => switchMode("login")}>Log in</button></>}
        </div>
      </div>
    </div>
  );
}
