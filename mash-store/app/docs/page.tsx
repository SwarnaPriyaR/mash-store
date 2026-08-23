"use client";

import { useEffect, useState } from "react";
import type { Metadata } from "next";

export default function SwaggerDocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Dynamically inject Swagger UI CSS and JS
    if (!document.getElementById("swagger-css")) {
      const link = document.createElement("link");
      link.id = "swagger-css";
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css";
      document.head.appendChild(link);
    }

    if (!document.getElementById("swagger-js")) {
      const script = document.createElement("script");
      script.id = "swagger-js";
      script.src = "https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js";
      script.onload = () => {
        // @ts-expect-error SwaggerUIBundle loaded from CDN
        if (window.SwaggerUIBundle) {
          // @ts-expect-error SwaggerUIBundle loaded from CDN
          window.SwaggerUIBundle({
            url: "/api/docs",
            dom_id: "#swagger-ui-container",
            deepLinking: true,
            presets: [
              // @ts-expect-error SwaggerUIBundle loaded from CDN
              window.SwaggerUIBundle.presets.apis,
              // @ts-expect-error SwaggerUIStandalonePreset loaded from CDN
              window.SwaggerUIStandalonePreset,
            ],
          });
        }
      };
      document.body.appendChild(script);
    } else {
      // @ts-expect-error SwaggerUIBundle loaded from CDN
      if (window.SwaggerUIBundle) {
        // @ts-expect-error SwaggerUIBundle loaded from CDN
        window.SwaggerUIBundle({
          url: "/api/docs",
          dom_id: "#swagger-ui-container",
          deepLinking: true,
        });
      }
    }
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ paddingTop: 80, minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ padding: "16px 24px", background: "#1a1714", color: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>MASH STORE API DOCUMENTATION</h1>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, opacity: 0.8 }}>Interactive Swagger UI for Adult & Kids Products REST APIs</p>
        </div>
        <a href="/api/docs" target="_blank" rel="noreferrer" style={{ color: "#60a5fa", fontSize: 13, textDecoration: "none", fontWeight: 600 }}>
          Open Raw OpenAPI JSON ↗
        </a>
      </div>
      <div id="swagger-ui-container" style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 0" }} />
    </div>
  );
}
