import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Product Database Functions ────────────────────────────────────────────

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return products;
  } catch (err) {
    console.error("getAllProducts error:", err);
    throw err;
  }
}

export async function addNewProduct(body) {
  const { name, basePrice, qty, fit, image, tags, description } = body;

  if (!name || name.trim() === "") {
    throw new Error("Product name is required");
  }
  if (basePrice === undefined || isNaN(basePrice) || basePrice < 0) {
    throw new Error("Price must be a valid non-negative number");
  }
  if (qty === undefined || isNaN(qty) || qty < 0) {
    throw new Error("Quantity must be a valid non-negative number");
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        basePrice: parseInt(basePrice),
        qty: parseInt(qty),
        fit: fit || "Regular",
        image: image || "",
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",") : []),
        description: description ? description.trim() : "",
      },
    });
    return newProduct;
  } catch (err) {
    console.error("addNewProduct error:", err);
    throw err;
  }
}

export async function updateProduct(id, body) {
  const { qty, basePrice, fit, tags, description } = body;
  const data = {};

  if (qty !== undefined) {
    if (isNaN(qty) || qty < 0) {
      throw new Error("Quantity must be a non-negative number");
    }
    data.qty = Math.max(0, parseInt(qty));
  }

  if (basePrice !== undefined) {
    if (isNaN(basePrice) || basePrice < 0) {
      throw new Error("Price must be a non-negative number");
    }
    data.basePrice = parseInt(basePrice);
  }

  if (fit !== undefined) data.fit = fit;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
  if (description !== undefined) data.description = description.trim();

  if (Object.keys(data).length === 0) {
    throw new Error("No valid fields to update");
  }

  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
    return updated;
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error(`Product with id ${id} not found`);
    }
    console.error(`updateProduct error:`, err);
    throw err;
  }
}

export async function removeProduct(id) {
  try {
    const deleted = await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    return { success: true, deleted };
  } catch (err) {
    if (err.code === "P2025") {
      throw new Error(`Product with id ${id} not found`);
    }
    console.error(`removeProduct error:`, err);
    throw err;
  }
}
