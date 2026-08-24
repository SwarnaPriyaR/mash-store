"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Props {
  title?: string;
  subtitle?: string;
  targetDays?: number;
}

export function UnderConstructionSection({
  title = "UNDER CONSTRUCTION",
  subtitle = "Explore New Kids Launches — Our new customizer & exclusive drop portal is undergoing scheduled upgrades. Subscribe now to get early notification of our launch date!",
  targetDays = 14,
}: Props) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Live ticking countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: targetDays,
    hours: 18,
    minutes: 42,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
    }, 3000);
  };

  const timerCircles = [
    { label: "DAYS", value: String(timeLeft.days).padStart(2, "0"), color: "#06b6d4" },
    { label: "HOURS", value: String(timeLeft.hours).padStart(2, "0"), color: "#3b82f6" },
    { label: "MINUTES", value: String(timeLeft.minutes).padStart(2, "0"), color: "#a855f7" },
    { label: "SECONDS", value: String(timeLeft.seconds).padStart(2, "0"), color: "#f43f5e" },
  ];

  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, rgba(19, 17, 16, 0.95) 0%, rgba(30, 27, 25, 0.98) 100%)",
        border: "1.5px solid var(--border)",
        borderRadius: 24,
        overflow: "hidden",
        padding: "48px 24px",
        marginBottom: 36,
        color: "#ffffff",
        textAlign: "center",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* BACKGROUND DECORATIVE GLOWS */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(232, 96, 62, 0.18) 0%, rgba(0, 0, 0, 0) 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 680, margin: "0 auto" }}>
        {/* UNDER CONSTRUCTION BADGE */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              background: "rgba(232, 96, 62, 0.15)",
              border: "1px solid #e8603e",
              color: "#ff7a55",
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "5px 14px",
              borderRadius: 99,
            }}
          >
            🚧 {title}
          </span>
        </div>

        {/* MAIN HEADING */}
        <h2
          style={{
            fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
            fontSize: 44,
            letterSpacing: "0.05em",
            margin: "0 0 10px 0",
            color: "#ffffff",
            textTransform: "uppercase",
          }}
        >
          EXPLORE NEW KIDS LAUNCHES — COMING SOON
        </h2>

        {/* SUBTITLE */}
        <p
          style={{
            fontSize: 14,
            color: "#a3988e",
            lineHeight: 1.6,
            maxWidth: 560,
            margin: "0 auto 36px",
            fontWeight: 400,
          }}
        >
          {subtitle}
        </p>

        {/* 4 CIRCULAR COUNTDOWN TIMERS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 36,
          }}
        >
          {timerCircles.map((c) => (
            <div
              key={c.label}
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: `2.5px solid ${c.color}`,
                boxShadow: `0 0 16px ${c.color}33`,
                background: "rgba(255, 255, 255, 0.03)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-bebas), 'Bebas Neue', sans-serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                {c.value}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: c.color,
                  letterSpacing: "0.08em",
                  marginTop: 3,
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* EMAIL NOTIFY SUBSCRIBE FORM */}
        {subscribed ? (
          <div
            style={{
              background: "rgba(22, 163, 74, 0.2)",
              border: "1px solid #16a34a",
              color: "#4ade80",
              padding: "12px 20px",
              borderRadius: 99,
              fontSize: 14,
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            ✓ Thank you! We will notify you as soon as Kids Launches go live!
          </div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              maxWidth: 480,
              margin: "0 auto",
              flexWrap: "wrap",
            }}
          >
            <input
              type="email"
              placeholder="Enter Email Address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: 1,
                minWidth: 240,
                padding: "12px 20px",
                borderRadius: 99,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.08)",
                color: "#ffffff",
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 28px",
                borderRadius: 99,
                border: "none",
                background: "linear-gradient(135deg, #e8603e 0%, #ff7a55 100%)",
                color: "#ffffff",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(232, 96, 62, 0.4)",
              }}
            >
              SUBSCRIBE
            </button>
          </form>
        )}

        <div style={{ marginTop: 24 }}>
          <Link
            href="/kids"
            style={{
              color: "#a3988e",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "underline",
              transition: "color 0.2s",
            }}
          >
            Or browse current Kids Styles here ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
