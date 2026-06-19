/**
 * MASH Store — Express + Prisma API Server
 * Connects to Neon PostgreSQL for durable inventory management.
 *
 * Routes:
 *   GET    /api/products          → List all products
 *   POST   /api/products          → Add a new product
 *   PATCH  /api/products/:id      → Update qty / basePrice / fit (partial)
 *   DELETE /api/products/:id      → Delete a product
 *   GET    /api/health            → Health check
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

// ── Request logger (dev) ──────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── GET /api/products ─────────────────────────────────────────────────────────
// Returns all products ordered by id (ascending).
app.get("/api/products", async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ error: "Failed to fetch products", detail: err.message });
  }
});

// ── POST /api/products ────────────────────────────────────────────────────────
// Creates a new product. Required body fields: name, basePrice, qty, fit, image.
// Optional: tags (string array), description.
app.post("/api/products", async (req, res) => {
  const { name, basePrice, qty, fit, image, tags, description } = req.body;

  // Validation
  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Product name is required" });
  }
  const parsedPrice = parseInt(basePrice);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ error: "basePrice must be a positive integer (INR)" });
  }
  const parsedQty = parseInt(qty);
  if (isNaN(parsedQty) || parsedQty < 0) {
    return res.status(400).json({ error: "qty must be a non-negative integer" });
  }
  if (!image || typeof image !== "string" || !image.trim()) {
    return res.status(400).json({ error: "image URL is required" });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        basePrice: parsedPrice,
        qty: parsedQty,
        fit: fit || "Regular",
        image: image.trim(),
        tags: Array.isArray(tags) ? tags : [],
        description: typeof description === "string" ? description.trim() : "",
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error("POST /api/products error:", err);
    res.status(500).json({ error: "Failed to create product", detail: err.message });
  }
});

// ── PATCH /api/products/:id ───────────────────────────────────────────────────
// Partial update — only send the fields you want to change.
// Supports: qty, basePrice, fit (and optionally name, image, tags, description).
app.patch("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });

  const { qty, basePrice, fit, name, image, tags, description } = req.body;
  const data = {};

  if (qty !== undefined) {
    const v = parseInt(qty);
    if (isNaN(v) || v < 0) return res.status(400).json({ error: "qty must be >= 0" });
    data.qty = v;
  }
  if (basePrice !== undefined) {
    const v = parseInt(basePrice);
    if (isNaN(v) || v <= 0) return res.status(400).json({ error: "basePrice must be > 0" });
    data.basePrice = v;
  }
  if (fit !== undefined) {
    if (!["Regular", "Oversized"].includes(fit)) {
      return res.status(400).json({ error: "fit must be Regular or Oversized" });
    }
    data.fit = fit;
  }
  if (name !== undefined) data.name = name.trim();
  if (image !== undefined) data.image = image.trim();
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
  if (description !== undefined) data.description = description.trim();

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const updated = await prisma.product.update({
      where: { id },
      data,
    });
    res.json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    console.error(`PATCH /api/products/${id} error:`, err);
    res.status(500).json({ error: "Failed to update product", detail: err.message });
  }
});

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
// Permanently deletes a product by id.
app.delete("/api/products/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });

  try {
    const deleted = await prisma.product.delete({ where: { id } });
    res.json({ success: true, deleted });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    console.error(`DELETE /api/products/${id} error:`, err);
    res.status(500).json({ error: "Failed to delete product", detail: err.message });
  }
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start server ──────────────────────────────────────────────────────────────
async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to Neon PostgreSQL via Prisma");
    app.listen(PORT, () => {
      console.log(`🚀 MASH Store API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Products: http://localhost:${PORT}/api/products`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
}

main();

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("\n👋 Server shut down gracefully");
  process.exit(0);
});
