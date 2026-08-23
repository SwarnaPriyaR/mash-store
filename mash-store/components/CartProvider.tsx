"use client";

/**
 * components/CartProvider.tsx
 * Global client-side state for cart, wishlist, and cached product list.
 * This is the single source of truth for all user-interaction state.
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { convertDriveUrl } from "@/lib/helpers";
import type { Product } from "@/lib/db";

export type CartProduct = Product & { price: number };
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
  const [dark, setDarkState] = useState(false);

  const toast = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const setDark = useCallback((v: boolean) => {
    setDarkState(v);
    document.documentElement.className = v ? "dark" : "";
  }, []);

  // Hydrate product cache for wishlist display
  useEffect(() => {
    fetch("/api/product/allProduct")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(data.map((p) => ({ ...p, price: p.basePrice, image: convertDriveUrl(p.image) })));
      })
      .catch(() => console.warn("Could not hydrate product cache"));
  }, []);

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
    setLoggedIn(true); setUser(name); toast(`Welcome, ${name}!`);
  }, [toast]);

  const handleLogout = useCallback(() => {
    setLoggedIn(false); setUser(null); toast("Logged out");
  }, [toast]);

  return (
    <CartContext.Provider value={{
      cart, wishlist, products,
      addToCart, removeFromCart, changeQty, toggleWishlist,
      toast, toasts,
      loggedIn, user, handleLogin, handleLogout,
      dark, setDark,
    }}>
      {children}
      {/* Global toast container */}
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
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
