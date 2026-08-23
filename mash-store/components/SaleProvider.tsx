"use client";

/**
 * components/SaleProvider.tsx
 * Client-side sale state backed by localStorage.
 * Provides sale status, scheduled offer countdown, and sale management to all Client Components.
 */

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { DEFAULT_SALE, type SaleState } from "@/lib/helpers";

interface SaleContextValue {
  sale: SaleState;
  setSale: (s: SaleState) => void;
}

const SaleContext = createContext<SaleContextValue | null>(null);

export function SaleProvider({ children }: { children: ReactNode }) {
  const [sale, setSaleState] = useState<SaleState>(DEFAULT_SALE);

  useEffect(() => {
    const saved = localStorage.getItem("mash_sale");
    if (saved) {
      try {
        setSaleState(JSON.parse(saved) as SaleState);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const setSale = useCallback((s: SaleState) => {
    setSaleState(s);
    localStorage.setItem("mash_sale", JSON.stringify(s));
  }, []);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "mash_sale" && e.newValue) {
        try { setSaleState(JSON.parse(e.newValue) as SaleState); } catch { /* ignore */ }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Background timer — auto-start and auto-expire scheduled sales
  useEffect(() => {
    const check = () => {
      const now = Date.now();
      if (sale.startTime) {
        const start = Number(sale.startTime);
        const durationMs = Number(sale.durationHours) * 3_600_000;
        const end = start + durationMs;

        if (now >= start && now <= end && !sale.active) {
          setSale({ ...sale, active: true, start, end });
        } else if (now > end && (sale.active || sale.startTime !== null)) {
          setSale(DEFAULT_SALE);
        } else if (now < start && sale.active) {
          setSale({ ...sale, active: false });
        }
      }
    };
    check();
    const id = setInterval(check, 1000);
    return () => clearInterval(id);
  }, [sale, setSale]);

  return (
    <SaleContext.Provider value={{ sale, setSale }}>
      {children}
    </SaleContext.Provider>
  );
}

export function useSale() {
  const ctx = useContext(SaleContext);
  if (!ctx) throw new Error("useSale must be used inside SaleProvider");
  return ctx;
}
