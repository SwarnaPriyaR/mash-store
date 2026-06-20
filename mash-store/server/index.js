/**
 * MASH Store — Express + Prisma API Server
 * Connects to Neon PostgreSQL for durable inventory management.
 *
 * Routes:
 *   GET    /api/product/allProduct      → List all products
 *   POST   /api/product/addNew          → Add a new product
 *   PATCH  /api/product/updateProduct/:id → Update qty / basePrice / fit (partial)
 *   DELETE /api/product/removeProduct/:id → Delete a product
 *   GET    /api/health                  → Health check
 *   GET    /api-docs                    → Swagger API documentation
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// ── Swagger Configuration ──────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MASH Store Inventory API Documentation",
      version: "1.0.0",
      description: "REST API server documentation for MASH Store inventory management backed by Neon PostgreSQL",
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: "Development Server",
      },
    ],
  },
  apis: [path.join(__dirname, "index.js")],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


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

// ── Swagger Component Definitions ─────────────────────────────────────────────
/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - basePrice
 *         - qty
 *         - fit
 *         - image
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-incrementing product ID
 *         name:
 *           type: string
 *           description: Name of the clothing item
 *         basePrice:
 *           type: integer
 *           description: Standard retail price in INR
 *         qty:
 *           type: integer
 *           description: Stock quantity available in inventory
 *         fit:
 *           type: string
 *           enum: [Regular, Oversized]
 *           description: Fit style
 *         image:
 *           type: string
 *           description: Image URL of the product
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of categorizing tags (e.g. Graphic, Unisex)
 *         description:
 *           type: string
 *           description: Detailed description of the product fabric, fit, and GSM
 */

// ── Health check ──────────────────────────────────────────────────────────────
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health Check Endpoint
 *     responses:
 *       200:
 *         description: API is online and functional
 */
const healthCheckHandler = (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
};
app.get("/api/health", healthCheckHandler);
app.get("/health", healthCheckHandler);

// ── GET /api/product/allProduct ───────────────────────────────────────────────
/**
 * @openapi
 * /api/product/allProduct:
 *   get:
 *     summary: Retrieve All Products
 *     description: Returns the entire clothing catalog sorted by ID in ascending order.
 *     responses:
 *       200:
 *         description: Successfully fetched product list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
const allProductHandler = async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error("GET /api/product/allProduct error:", err);
    res.status(500).json({ error: "Failed to fetch products", detail: err.message });
  }
};
app.get("/api/product/allProduct", allProductHandler);
app.get("/product/allProduct", allProductHandler);

// ── POST /api/product/addNew ──────────────────────────────────────────────────
/**
 * @openapi
 * /api/product/addNew:
 *   post:
 *     summary: Add a New Product
 *     description: Inserts a new clothing item into the Neon database catalog.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid request body parameters
 */
const addNewHandler = async (req, res) => {
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
    console.error("POST /api/product/addNew error:", err);
    res.status(500).json({ error: "Failed to create product", detail: err.message });
  }
};
app.post("/api/product/addNew", addNewHandler);
app.post("/product/addNew", addNewHandler);

// ── PATCH /api/product/updateProduct/:id ───────────────────────────────────────
/**
 * @openapi
 * /api/product/updateProduct/{id}:
 *   patch:
 *     summary: Update an Existing Product
 *     description: Modifies stock quantity, base price, fit style, or metadata of a product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qty:
 *                 type: integer
 *               basePrice:
 *                 type: integer
 *               fit:
 *                 type: string
 *                 enum: [Regular, Oversized]
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid inputs
 *       404:
 *         description: Product not found
 */
const updateProductHandler = async (req, res) => {
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
    console.error(`PATCH /api/product/updateProduct/${id} error:`, err);
    res.status(500).json({ error: "Failed to update product", detail: err.message });
  }
};
app.patch("/api/product/updateProduct/:id", updateProductHandler);
app.patch("/product/updateProduct/:id", updateProductHandler);

// ── DELETE /api/product/removeProduct/:id ──────────────────────────────────────
/**
 * @openapi
 * /api/product/removeProduct/{id}:
 *   delete:
 *     summary: Remove a Product
 *     description: Permanently deletes a product item from the catalog by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
const removeProductHandler = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product id" });

  try {
    const deleted = await prisma.product.delete({ where: { id } });
    res.json({ success: true, deleted });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: `Product with id ${id} not found` });
    }
    console.error(`DELETE /api/product/removeProduct/${id} error:`, err);
    res.status(500).json({ error: "Failed to delete product", detail: err.message });
  }
};
app.delete("/api/product/removeProduct/:id", removeProductHandler);
app.delete("/api/product/remove-product/:id", removeProductHandler);
app.delete("/api/product/remove/:id", removeProductHandler);
app.delete("/product/removeProduct/:id", removeProductHandler);
app.delete("/product/remove-product/:id", removeProductHandler);
app.delete("/product/remove/:id", removeProductHandler);


// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Start server ──────────────────────────────────────────────────────────────
async function main() {
  try {
    await prisma.$connect();
    console.log("✅ Connected to Neon PostgreSQL via Prisma");
    
    // Start automated stock check cron jobs (8:30 AM & 5:00 PM IST)
    require("./cron");

    app.listen(PORT, () => {
      console.log(`🚀 MASH Store API running on http://localhost:${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log(`   Products: http://localhost:${PORT}/api/product/allProduct`);
      console.log(`   Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to database:", err.stack || err);
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
