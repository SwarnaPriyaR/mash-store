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
  category: string;
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
  category?: string;
  image: string;
  tags: string[];
  description: string;
};

export type UpdateProductPayload = Partial<{
  qty: number;
  basePrice: number;
  fit: string;
  category: string;
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

/** Fetch products by category */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: {
        OR: [
          { category: { equals: category, mode: "insensitive" } },
          { tags: { has: category } },
        ],
      },
      orderBy: { id: "asc" },
    });
  } catch {
    // Fallback for databases where schema push hasn't been executed yet:
    // fetch all products and filter in JS safely without throwing validation error
    const all = await prisma.product.findMany({ orderBy: { id: "asc" } });
    const catLower = category.toLowerCase();
    return all.filter((p) => {
      const pCat = (p as Record<string, unknown>).category as string | undefined;
      if (pCat && pCat.toLowerCase() === catLower) return true;
      if (p.tags && p.tags.some((t) => t.toLowerCase() === catLower)) return true;
      if (
        catLower.includes("kids") &&
        (p.name.toLowerCase().includes("kid") || p.description.toLowerCase().includes("kid"))
      ) {
        return true;
      }
      return false;
    });
  }
}

/** Fetch a single product by ID, returns null if not found */
export async function getProductById(id: number): Promise<Product | null> {
  return prisma.product.findUnique({ where: { id } });
}

/** Create a new product */
export async function createProduct(data: NewProductPayload): Promise<Product> {
  return prisma.product.create({
    data: {
      ...data,
      category: data.category || "Men T-Shirt",
    },
  });
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
