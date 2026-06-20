// src/hooks/useToast.js
import { useState, useCallback, useEffect } from "react";

/**
 * Lightweight toast notification hook.
 * Returns { toasts, add }
 *   add(msg)  — shows a toast for 3 s then auto-removes it
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((msg) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return { toasts, add };
}

// src/hooks/useCountdown.js  (exported from same file for convenience)

/**
 * Returns a "HH:MM:SS" countdown string until `endTime` (epoch ms),
 * or null when the timer reaches zero.
 */
export function useCountdown(endTime) {
  const [remaining, setRemaining] = useState(Math.max(0, endTime - Date.now()));

  useEffect(() => {
    if (!endTime) return;
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  if (remaining <= 0) return null;
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const handleHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);
  return hash;
}

