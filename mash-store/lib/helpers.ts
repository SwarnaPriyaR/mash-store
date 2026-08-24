/**
 * lib/helpers.ts
 * Migrated from src/utils/helpers.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure utility functions (no server/client distinction — usable anywhere).
 */

export type SaleState = {
  active: boolean;
  discount: number;
  start: number;
  end: number;
  startTime: number | null;
  durationHours: number;
  target?: "both" | "adult" | "kids";
};

export const DEFAULT_SALE: SaleState = {
  active: false,
  discount: 0,
  start: 0,
  end: 0,
  startTime: null,
  durationHours: 0,
  target: "both",
};

/** Returns the sale price for a product if a sale is currently active, else null */
export const getSalePrice = (
  product: { basePrice: number },
  sale: SaleState,
  isKids: boolean = false
): number | null => {
  if (!sale || !sale.active) return null;
  const now = Date.now();
  if (now >= sale.start && now <= sale.end) {
    const target = sale.target || "both";
    if (target === "adult" && isKids) return null;
    if (target === "kids" && !isKids) return null;
    return Math.round(product.basePrice * (1 - sale.discount / 100));
  }
  return null;
};

/** Converts a Google Drive share URL to a direct-access thumbnail URL */
export const convertDriveUrl = (url: string | undefined | null): string => {
  if (!url) return url as string;
  if (url.includes("googleusercontent.com/d/")) return url;

  const fileDRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
  const idQueryRegex = /[?&]id=([a-zA-Z0-9_-]+)/;

  let fileId: string | null = null;
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

/** Parses per-size stock map from sizeStock object or description marker */
export function getSizeStock(
  product: { sizes?: string[]; qty?: number; description?: string; sizeStock?: Record<string, number> }
): Record<string, number> {
  if (product.sizeStock && typeof product.sizeStock === "object") {
    return product.sizeStock;
  }

  if (product.description && product.description.includes("<!--SIZE_STOCK:")) {
    try {
      const match = product.description.match(/<!--SIZE_STOCK:(.*?)-->/);
      if (match && match[1]) {
        return JSON.parse(match[1]);
      }
    } catch {
      // ignore
    }
  }

  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["S", "M", "L", "XL"];
  const total = product.qty !== undefined ? product.qty : 0;
  const perSize = Math.floor(total / sizes.length);
  const remainder = total % sizes.length;

  const result: Record<string, number> = {};
  sizes.forEach((sz, idx) => {
    result[sz] = perSize + (idx === 0 ? remainder : 0);
  });
  return result;
}

/** Embeds size stock JSON marker inside description */
export function embedSizeStockInDescription(desc: string = "", sizeStock: Record<string, number>): string {
  const cleanDesc = desc.replace(/<!--SIZE_STOCK:.*?-->/g, "").trim();
  return `${cleanDesc} <!--SIZE_STOCK:${JSON.stringify(sizeStock)}-->`;
}

/** Returns list of sizes that have inventory stock > 0 for a product */
export function getAvailableSizes(
  product: { sizes?: string[]; qty?: number; description?: string; sizeStock?: Record<string, number> },
  isKids: boolean = false
): string[] {
  if (product.qty !== undefined && product.qty <= 0) {
    return [];
  }

  const stockMap = getSizeStock(product);
  const defaultSizes = isKids
    ? ["2–3 Years", "4–5 Years", "5–6 Years", "6–7 Years", "8–9 Years"]
    : ["S", "M", "L", "XL"];
  const rawSizes = product.sizes && product.sizes.length > 0 ? product.sizes : defaultSizes;

  // Only include sizes where inventory stock is > 0
  const available = rawSizes.filter((sz) => (stockMap[sz] ?? 0) > 0);
  return available;
}
