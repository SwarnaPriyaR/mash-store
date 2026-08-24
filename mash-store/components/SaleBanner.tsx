"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import type { SaleState } from "@/lib/helpers";

interface Props {
  sale: SaleState;
  type: "active" | "upcoming";
}

function useCountdown(endTime: number | null) {
  const [remaining, setRemaining] = useState(endTime ? Math.max(0, endTime - Date.now()) : 0);

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

export function SaleBanner({ sale, type }: Props) {
  if (type === "active") {
    const timer = useCountdown(sale.end);
    return (
      <div className="sale-banner" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 101, height: 40 }}>
        <Icon.Tag /> SALE LIVE — {sale.discount}% OFF EVERYTHING!
        {timer && <span className="sale-timer">Ends in {timer}</span>}
      </div>
    );
  }

  const timer = useCountdown(sale.startTime);
  return (
    <div className="sale-banner" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 101, height: 40,
      background: "linear-gradient(90deg,#ea580c,#d4af37)", color: "#1a1714",
    }}>
      UPCOMING OFFER: {sale.discount}% DISCOUNT IN &nbsp;
      {timer && <span className="sale-timer" style={{ background: "rgba(0,0,0,0.15)", color: "#1a1714" }}>{timer}</span>}
    </div>
  );
}
