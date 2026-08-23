/**
 * lib/db.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All Prisma query functions used by Server Components and Route Handlers.
 * These run server-side only — no HTTP round-trips needed.
 */
import { prisma } from "./prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Product = {
  id: number;
  name: string;
  basePrice: number;
  qty: number;
  fit: string;
  image: string;
  tags: string[];
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type NewProductPayload = {
  name: string;
  basePrice: number;
  qty: number;
  fit: string;
  image: string;
  tags: string[];
  description: string;
};

export type UpdateProductPayload = Partial<{
  qty: number;
  basePrice: number;
  fit: string;
  name: string;
  image: string;
  tags: string[];
  description: string;
}>;

// ── Query Functions ────────────────────────────────────────────────────────────

/** Fetch all products sorted by ID ascending */
export async function getAllProducts(): Promise<Product[]> {
  return prisma.product.findMany({ orderBy: { id: "asc" } });
}

/** Fetch a single product by ID, returns null if not found */
export async function getProductById(id: number): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

/** Create a new product */
export async function createProduct(data: NewProductPayload): Promise<Product> {
  return prisma.product.create({ data });
}

/** Partially update a product by ID */
export async function updateProduct(
  id: number,
  data: UpdateProductPayload
): Promise<Product> {
  return prisma.product.update({ where: { id }, data });
}

/** Delete a product by ID */
export async function deleteProduct(id: number): Promise<Product> {
  return prisma.product.delete({ where: { id } });
}
