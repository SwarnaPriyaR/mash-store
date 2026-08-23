"use client";

/**
 * components/NavBar.tsx
 * Sticky nav with logo, auth buttons, cart/wishlist badges, dark mode toggle.
 * Client Component because it needs cart counts, auth state, and dark mode.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";
import { useCart } from "./CartProvider";
import { useSale } from "./SaleProvider";
import { AuthModal } from "./AuthModal";
import { SaleBanner } from "./SaleBanner";

export function NavBar() {
  const { cart, wishlist, loggedIn, user, handleLogin, handleLogout, dark, setDark } = useCart();
  const { sale } = useSale();
  const [authModal, setAuthModal] = useState<"login" | "signup" | null>(null);
  const pathname = usePathname();

  // Don't render nav on admin page — admin has its own sidebar
  if (pathname === "/admin") return null;

  const cartCount = cart.length;
  const wishCount = wishlist.length;
  const isSaleActive = sale.active && Date.now() >= sale.start && Date.now() <= sale.end;
  const isUpcomingSale = !isSaleActive && sale.startTime != null && Date.now() < Number(sale.startTime);
  const hasBanner = isSaleActive || isUpcomingSale;

  const isKidsPage = pathname === "/kids";

  return (
    <>
      {isSaleActive && <SaleBanner sale={sale} type="active" />}
      {isUpcomingSale && <SaleBanner sale={sale} type="upcoming" />}

      <nav className="nav" style={{ top: hasBanner ? 40 : 0 }}>
        <Link href="/" className="nav-logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/asset/mashLogo.png"
            alt="MASH Logo"
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
              objectFit: "cover",
              boxShadow: "0 0 12px rgba(6, 182, 212, 0.4)",
            }}
          />
          <img
            src={dark ? "/asset/logoDark.png" : "/asset/logoLight.png"}
            alt="MASH"
            style={{
              height: 40,
              width: "auto",
              objectFit: "contain",
              transition: "opacity 0.2s",
            }}
          />
        </Link>
        <div className="nav-right">
          <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">
            {dark ? <Icon.Sun /> : <Icon.Moon />}
          </button>

          {loggedIn ? (
            <button className="auth-btn" onClick={handleLogout}>
              {user?.split(" ")[0]} · Logout
            </button>
          ) : (
            <>
              <button className="auth-btn" onClick={() => setAuthModal("login")}>Log in</button>
              <button className="auth-btn primary" onClick={() => setAuthModal("signup")}>Sign up</button>
            </>
          )}

          <Link href="/wishlist" className="icon-btn" title="Wishlist" style={{ textDecoration: "none" }}>
            <Icon.Heart filled={wishCount > 0} />
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </Link>
          <Link href="/cart" className="icon-btn" title="Cart" style={{ textDecoration: "none" }}>
            <Icon.Cart />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </Link>
        </div>
      </nav>

      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onLogin={(name) => { handleLogin(name); setAuthModal(null); }}
          switchMode={(m) => setAuthModal(m)}
        />
      )}
    </>
  );
}
