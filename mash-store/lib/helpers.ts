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
};

export const DEFAULT_SALE: SaleState = {
  active: false,
  discount: 0,
  start: 0,
  end: 0,
  startTime: null,
  durationHours: 0,
};

/** Returns the sale price for a product if a sale is currently active, else null */
export const getSalePrice = (
  product: { basePrice: number },
  sale: SaleState
): number | null => {
  if (!sale || !sale.active) return null;
  const now = Date.now();
  if (now >= sale.start && now <= sale.end) {
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
