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

// ── Helpers ───────────────────────────────────────────────────────────────────
const getSalePrice = (product, sale) => {
  if (!sale || !sale.active) return null;
  const now = Date.now();
  if (now >= sale.start && now <= sale.end) {
    return Math.round(product.basePrice * (1 - sale.discount / 100));
  }
  return null;
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
  const [showAdmin, setShowAdmin] = useState(false);

  // Products with basePrice for sale calculations
  const [products, setProducts] = useState(() =>
    INITIAL_PRODUCTS.map(p => ({ ...p, basePrice: p.price }))
  );

  // Sale state
  const [sale, setSale] = useState({ active: false, discount: 0, start: 0, end: 0 });

  // Notification log (simulated)
  const [notifyLog, setNotifyLog] = useState([
    { time: "09:00 AM", msg: "Stock check: All products above threshold." },
  ]);

  const { toasts, add: toast } = useToast();

  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "";
  }, [dark]);

  // Apply/remove sale prices when sale changes
  useEffect(() => {
    setProducts(prev => prev.map(p => {
      const salePrice = getSalePrice(p, sale);
      return { ...p, price: salePrice !== null ? salePrice : p.basePrice };
    }));
  }, [sale]);

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
      setNotifyLog(prev => [...prev, { time: now, msg: msgs.join(" | ") }]);
      // In production: send email to swarnapriya.kr@gmail.com via backend API
    };
    runStockCheck();
    // Schedule for 9AM and 6PM IST (demo: also fires every 12h from now)
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

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", color:"var(--text)", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{STYLES}</style>

      {/* Sale banner */}
      {isSaleActive && <SaleBanner sale={sale} />}

      {/* NAV */}
      <nav className="nav" style={{ top: isSaleActive ? 40 : 0 }}>
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
          <button className="admin-btn" onClick={() => setShowAdmin(true)} title="Admin">
            <Icon.Shield /> Admin
          </button>
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
      <div className="page" style={{ paddingTop: isSaleActive ? 104 : 64 }}>
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

      {/* ADMIN */}
      {showAdmin && <AdminPanel products={products} setProducts={setProducts} sale={sale} setSale={setSale} notifyLog={notifyLog} setNotifyLog={setNotifyLog} onClose={() => setShowAdmin(false)} toast={toast} />}

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

// ── Admin Panel ───────────────────────────────────────────────────────────────
function AdminPanel({ products, setProducts, sale, setSale, notifyLog, setNotifyLog, onClose, toast }) {
  const [tab, setTab] = useState("inventory");
  const [editValues, setEditValues] = useState({});
  const [saleForm, setSaleForm] = useState({ discount: sale.discount || 10, hours: 24 });
  const [adminPass, setAdminPass] = useState("");
  const [authed, setAuthed] = useState(false);

  if (!authed) return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>×</button>
        <h2 className="modal-title">ADMIN ACCESS</h2>
        <p className="modal-sub">Enter admin password to continue</p>
        <div className="form-field">
          <label className="form-label">Password</label>
          <input className="form-input" type="password" placeholder="••••••••" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === "Enter" && (adminPass === "mash@admin" ? setAuthed(true) : toast("Incorrect password"))} />
        </div>
        <button className="modal-submit" onClick={() => adminPass === "mash@admin" ? setAuthed(true) : toast("Incorrect password")}>ENTER</button>
        <p style={{ textAlign:"center", marginTop:12, fontSize:12, color:"var(--text2)" }}>Demo password: <strong>mash@admin</strong></p>
      </div>
    </div>
  );

  const lowStock = products.filter(p => p.qty > 0 && p.qty < 5);
  const outStock = products.filter(p => p.qty === 0);
  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;

  const updateProduct = (id, field, value) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: field === "qty" ? Math.max(0, parseInt(value)||0) : field === "price" || field === "basePrice" ? parseFloat(value)||p.basePrice : value };
      if (field === "basePrice") updated.price = isSaleActive ? Math.round(updated.basePrice * (1 - sale.discount/100)) : updated.basePrice;
      return updated;
    }));
  };

  const removeProduct = (id) => { setProducts(prev => prev.filter(p => p.id !== id)); toast("Product removed"); };

  const activateSale = () => {
    const start = Date.now();
    const end = start + saleForm.hours * 3600000;
    setSale({ active: true, discount: saleForm.discount, start, end });
    setProducts(prev => prev.map(p => ({ ...p, price: Math.round(p.basePrice * (1 - saleForm.discount/100)) })));
    toast(`🎉 Sale activated! ${saleForm.discount}% off for ${saleForm.hours}h`);
  };

  const deactivateSale = () => {
    setSale({ active: false, discount: 0, start: 0, end: 0 });
    setProducts(prev => prev.map(p => ({ ...p, price: p.basePrice })));
    toast("Sale ended. Prices restored.");
  };

  const runManualCheck = () => {
    const low = products.filter(p => p.qty < 5 && p.qty > 0);
    const out = products.filter(p => p.qty === 0);
    const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
    let msg = low.length ? `Low stock: ${low.map(p => p.name+" (qty:"+p.qty+")").join(", ")}` : "";
    if (out.length) msg += (msg ? " | " : "") + `Out of stock: ${out.map(p => p.name).join(", ")}`;
    if (!msg) msg = "All products above threshold.";
    setNotifyLog(prev => [...prev, { time: now, msg }]);
    toast("📧 Stock check run — email sent to swarnapriya.kr@gmail.com");
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--radius)", width:"100%", maxWidth:900, maxHeight:"92vh", overflowY:"auto", animation:"modalIn 0.22s ease", boxShadow:"var(--shadow-lg)" }}>
        <div style={{ padding:"24px 32px 0", borderBottom:"1px solid var(--border)", position:"sticky", top:0, background:"var(--surface)", zIndex:2 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
            <div>
              <h1 className="admin-title">ADMIN PANEL</h1>
              <p className="admin-sub">Manage inventory, pricing, and sales for MASH</p>
            </div>
            <button className="modal-close" style={{ position:"relative", top:0, right:0 }} onClick={onClose}>×</button>
          </div>
          <div className="admin-tabs">
            {[["inventory","📦 Inventory"],["sale","🏷️ Sale Control"],["notifications","🔔 Notifications"]].map(([id,label]) => (
              <button key={id} className={`admin-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:"28px 32px 32px" }}>

          {/* ── INVENTORY ── */}
          {tab === "inventory" && (
            <div>
              <div className="admin-stat-grid">
                <div className="admin-stat"><div className="admin-stat-label">Total Products</div><div className="admin-stat-val">{products.length}</div></div>
                <div className="admin-stat"><div className="admin-stat-label">Total Stock</div><div className="admin-stat-val">{products.reduce((s,p) => s+p.qty,0)}</div></div>
                <div className="admin-stat"><div className="admin-stat-label">Low Stock (&lt;5)</div><div className={`admin-stat-val ${lowStock.length > 0 ? "warn" : ""}`}>{lowStock.length}</div></div>
                <div className="admin-stat"><div className="admin-stat-label">Out of Stock</div><div className={`admin-stat-val ${outStock.length > 0 ? "danger" : ""}`}>{outStock.length}</div></div>
              </div>

              {lowStock.length > 0 && (
                <div className="alert-banner">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-text"><strong>Low stock alert:</strong> {lowStock.map(p => `${p.name} (${p.qty} left)`).join(", ")}</div>
                </div>
              )}

              <div className="admin-card">
                <div className="admin-card-title">📦 Product Inventory</div>
                <div style={{ display:"grid", gridTemplateColumns:"60px 1fr 100px 110px 110px 110px 48px", gap:12, padding:"8px 16px", background:"var(--bg2)", borderRadius:"var(--radius-sm) var(--radius-sm) 0 0", borderBottom:"1px solid var(--border)" }}>
                  {["","Product","Qty","Adj. Qty","Base Price","Fit",""].map((h,i) => <span key={i} style={{ fontSize:11, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text2)" }}>{h}</span>)}
                </div>
                {products.map(p => (
                  <div key={p.id} style={{ display:"grid", gridTemplateColumns:"60px 1fr 100px 110px 110px 110px 48px", gap:12, alignItems:"center", padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
                    <img src={p.image} alt={p.name} className="admin-thumb" />
                    <div><div className="admin-name">{p.name}</div><div className="admin-id">ID: {p.id}</div></div>
                    <span className={`admin-qty-badge ${p.qty === 0 ? "qty-out" : p.qty < 5 ? "qty-low" : "qty-ok"}`}>{p.qty}</span>
                    <input className="admin-input" type="number" placeholder="New qty"
                      value={editValues[`qty_${p.id}`] ?? ""}
                      onChange={e => setEditValues(v => ({ ...v, [`qty_${p.id}`]: e.target.value }))}
                      onBlur={e => { if (e.target.value !== "") { updateProduct(p.id, "qty", e.target.value); setEditValues(v => ({ ...v, [`qty_${p.id}`]: "" })); toast(`Stock updated for ${p.name}`); }}}
                    />
                    <input className="admin-input" type="number" placeholder="Base price"
                      value={editValues[`price_${p.id}`] ?? ""}
                      onChange={e => setEditValues(v => ({ ...v, [`price_${p.id}`]: e.target.value }))}
                      onBlur={e => { if (e.target.value !== "") { updateProduct(p.id, "basePrice", e.target.value); setEditValues(v => ({ ...v, [`price_${p.id}`]: "" })); toast(`Price updated for ${p.name}`); }}}
                    />
                    <select className="admin-input" value={p.fit} onChange={e => { updateProduct(p.id, "fit", e.target.value); toast(`Fit updated`); }}>
                      <option>Regular</option><option>Oversized</option>
                    </select>
                    <button className="admin-del-btn" onClick={() => removeProduct(p.id)} title="Remove product"><Icon.Trash /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── SALE CONTROL ── */}
          {tab === "sale" && (
            <div>
              <div className="admin-card">
                <div className="admin-card-title">
                  🏷️ Sale Status &nbsp;
                  {isSaleActive ? <span className="sale-active-badge">● LIVE</span> : <span className="sale-inactive-badge">○ Inactive</span>}
                </div>
                {isSaleActive ? (
                  <div>
                    <p style={{ fontSize:14, color:"var(--text2)", marginBottom:16 }}>Sale is currently live with <strong>{sale.discount}%</strong> discount across all products.</p>
                    <button className="admin-action-btn" style={{ background:"#fee2e2", color:"#dc2626", borderColor:"#dc2626" }} onClick={deactivateSale}>⏹ End Sale Now</button>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize:14, color:"var(--text2)", marginBottom:20 }}>Set a sitewide discount for a limited time. All product prices will drop automatically.</p>
                    <div className="sale-form">
                      <div className="form-field">
                        <label className="form-label">Discount Percentage</label>
                        <input className="form-input" type="number" min={1} max={90} placeholder="e.g. 20" value={saleForm.discount} onChange={e => setSaleForm(f => ({ ...f, discount: Math.min(90, Math.max(1, parseInt(e.target.value)||1)) }))} />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Duration (Hours)</label>
                        <input className="form-input" type="number" min={1} max={720} placeholder="e.g. 24" value={saleForm.hours} onChange={e => setSaleForm(f => ({ ...f, hours: Math.max(1, parseInt(e.target.value)||1) }))} />
                      </div>
                      <div className="form-field full">
                        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"12px 16px", fontSize:13, color:"var(--text2)" }}>
                          Preview: All prices will drop by <strong>{saleForm.discount}%</strong> for <strong>{saleForm.hours} hour{saleForm.hours !== 1 ? "s" : ""}</strong>. A countdown timer will show in the top banner.
                        </div>
                      </div>
                    </div>
                    <button className="admin-action-btn" style={{ background:"var(--accent)", color:"#fff", borderColor:"var(--accent)", padding:"12px 28px", fontSize:14 }} onClick={activateSale}>
                      🚀 Activate Sale
                    </button>
                  </div>
                )}
              </div>

              <div className="admin-card">
                <div className="admin-card-title">📊 Price Preview After Sale</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
                  {products.map(p => {
                    const saleP = Math.round(p.basePrice * (1 - saleForm.discount/100));
                    return (
                      <div key={p.id} style={{ background:"var(--bg2)", borderRadius:"var(--radius-sm)", padding:"12px 14px" }}>
                        <div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>{p.name}</div>
                        <div style={{ display:"flex", gap:8, alignItems:"baseline" }}>
                          <span style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:"var(--accent)" }}>₹{saleP}</span>
                          <span style={{ fontSize:12, color:"var(--text2)", textDecoration:"line-through" }}>₹{p.basePrice}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {tab === "notifications" && (
            <div>
              <div className="admin-card">
                <div className="admin-card-title"><Icon.Bell /> Stock Alert Settings</div>
                <p style={{ fontSize:14, color:"var(--text2)", marginBottom:16, lineHeight:1.6 }}>
                  Automatic stock check emails are sent to <strong>swarnapriya.kr@gmail.com</strong> twice daily at <strong>9:00 AM IST</strong> and <strong>6:00 PM IST</strong>. Any product with quantity below 5 triggers an alert.
                </p>
                <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"10px 16px", fontSize:13, display:"flex", gap:8, alignItems:"center" }}>
                    <span>📧</span> swarnapriya.kr@gmail.com
                  </div>
                  <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-sm)", padding:"10px 16px", fontSize:13, display:"flex", gap:8, alignItems:"center" }}>
                    <span>⏰</span> 9:00 AM & 6:00 PM IST
                  </div>
                  <button className="admin-action-btn" onClick={runManualCheck}>▶ Run Check Now</button>
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-title">📋 Notification Log</div>
                <div className="notify-log">
                  {[...notifyLog].reverse().map((n, i) => (
                    <div className="notify-item" key={i}>
                      <span className="notify-time">{n.time}</span>
                      <span>{n.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <div className="admin-card-title">📦 Current Stock Overview</div>
                {products.map(p => (
                  <div key={p.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                    <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                      <img src={p.image} alt="" style={{ width:40, height:44, objectFit:"cover", borderRadius:6 }} />
                      <span style={{ fontSize:14, fontWeight:600 }}>{p.name}</span>
                    </div>
                    <span className={`admin-qty-badge ${p.qty === 0 ? "qty-out" : p.qty < 5 ? "qty-low" : "qty-ok"}`}>
                      {p.qty === 0 ? "Out of Stock" : p.qty < 5 ? `⚠ ${p.qty} left` : `✓ ${p.qty}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
