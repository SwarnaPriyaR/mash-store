"use client";

/**
 * components/CartProvider.tsx
 * Global client-side state for cart, wishlist, and cached product list with DB persistence.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { convertDriveUrl } from "@/lib/helpers";
import type { Product } from "@/lib/db";

export type CartProduct = Product & { price: number; isKids?: boolean };
export type CartItem = { product: CartProduct; qty: number };

interface CartContextValue {
  cart: CartItem[];
  wishlist: number[];
  products: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  changeQty: (id: number, delta: number) => void;
  toggleWishlist: (product: CartProduct | Product) => void;
  toast: (msg: string) => void;
  toasts: { id: number; msg: string }[];
  loggedIn: boolean;
  user: string | null;
  userEmail: string | null;
  handleLogin: (name: string) => void;
  handleLogout: () => void;
  dark: boolean;
  setDark: (v: boolean) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [products, setProducts] = useState<CartProduct[]>([]);
  const [toasts, setToasts] = useState<{ id: number; msg: string }[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [dark, setDarkState] = useState(false);
  const [isLoadedFromDb, setIsLoadedFromDb] = useState(false);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const setDark = useCallback((v: boolean) => {
    setDarkState(v);
    document.documentElement.classList.toggle("dark", v);
  }, []);

  // Hydrate product cache
  useEffect(() => {
    fetch("/api/product/allProduct")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data.map((p) => ({ ...p, price: p.basePrice, image: convertDriveUrl(p.image) })));
      })
      .catch(() => console.warn("Could not hydrate product cache"));
  }, []);

  // Hydrate OAuth user session & fetch customer cart & wishlist from DB
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (res) => {
        if (res.authenticated && res.user) {
          setLoggedIn(true);
          setUser(res.user.name || res.user.email.split("@")[0]);
          setUserEmail(res.user.email);

          // Fetch customer cart from DB
          try {
            const cartRes = await fetch("/api/customer/cart");
            if (cartRes.ok) {
              const cartData = await cartRes.json();
              if (cartData.items && Array.isArray(cartData.items) && cartData.items.length > 0) {
                // Fetch products to map cart items
                const prodsRes = await fetch("/api/product/allProduct");
                const allProds: Product[] = prodsRes.ok ? await prodsRes.json() : [];

                const mappedCart: CartItem[] = cartData.items.map((it: { productId: number; qty: number; size: string }) => {
                  const match = allProds.find((p) => p.id === it.productId);
                  const prodObj: CartProduct = match
                    ? { ...match, price: match.basePrice, image: convertDriveUrl(match.image) }
                    : {
                        id: it.productId,
                        name: `Product #${it.productId} (${it.size})`,
                        basePrice: 799,
                        price: 799,
                        qty: 10,
                        fit: "Regular",
                        category: "Men",
                        sizes: ["S", "M", "L", "XL"],
                        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a",
                        tags: [],
                        description: "",
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                  return { product: prodObj, qty: it.qty };
                });
                setCart(mappedCart);
              }
            }
          } catch {}

          // Fetch customer wishlist from DB
          try {
            const wishRes = await fetch("/api/customer/wishlist");
            if (wishRes.ok) {
              const wishData = await wishRes.json();
              if (wishData.wishlist && Array.isArray(wishData.wishlist)) {
                setWishlist(wishData.wishlist);
              }
            }
          } catch {}

          setIsLoadedFromDb(true);
        }
      })
      .catch(() => {});
  }, []);

  // Sync Cart to DB when cart updates & user is logged in
  useEffect(() => {
    if (loggedIn && isLoadedFromDb) {
      const dbItems = cart.map((ci) => ({
        productId: ci.product.id,
        qty: ci.qty,
        size: ci.product.name.includes("(") ? ci.product.name.split("(")[1].replace(")", "") : "S",
      }));
      fetch("/api/customer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: dbItems }),
      }).catch(() => {});
    }
  }, [cart, loggedIn, isLoadedFromDb]);

  // Sync Wishlist to DB when wishlist updates & user is logged in
  useEffect(() => {
    if (loggedIn && isLoadedFromDb) {
      fetch("/api/customer/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlist }),
      }).catch(() => {});
    }
  }, [wishlist, loggedIn, isLoadedFromDb]);

  const addToCart = useCallback((product: CartProduct) => {
    if (product.qty <= 0) { toast("Out of stock!"); return; }
    setCart((c) => {
      const ex = c.find((x) => x.product.id === product.id);
      if (ex) return c.map((x) => x.product.id === product.id ? { ...x, qty: x.qty + 1 } : x);
      return [...c, { product, qty: 1 }];
    });
    toast(`"${product.name}" added to cart`);
  }, [toast]);

  const removeFromCart = useCallback((id: number) => {
    setCart((c) => c.filter((x) => x.product.id !== id));
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setCart((c) => c.map((x) => x.product.id === id ? { ...x, qty: Math.max(1, x.qty + delta) } : x));
  }, []);

  const toggleWishlist = useCallback((product: CartProduct | Product) => {
    const p = { ...product, price: (product as CartProduct).price ?? (product as Product).basePrice };
    setWishlist((w) => {
      if (w.includes(product.id)) { toast("Removed from wishlist"); return w.filter((id) => id !== product.id); }
      toast(`"${product.name}" wishlisted`);
      return [...w, product.id];
    });
    setProducts((prev) => {
      if (prev.find((x) => x.id === product.id)) return prev;
      return [...prev, p as CartProduct];
    });
  }, [toast]);

  const handleLogin = useCallback((name: string) => {
    setLoggedIn(true);
    setUser(name);
    const email = name.includes("@") ? name : `${name.toLowerCase().replace(/\s+/g, "")}@gmail.com`;
    setUserEmail(email);
    toast(`Welcome, ${name}!`);
  }, [toast]);

  const handleLogout = useCallback(async () => {
    setLoggedIn(false); setUser(null); setUserEmail(null); setCart([]); setWishlist([]);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    toast("Logged out successfully");
  }, [toast]);

  return (
    <CartContext.Provider value={{
      cart, wishlist, products,
      addToCart, removeFromCart, changeQty, toggleWishlist,
      toast, toasts,
      loggedIn, user, userEmail, handleLogin, handleLogout,
      dark, setDark,
    }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="toast">{t.msg}</div>
        ))}
      </div>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
