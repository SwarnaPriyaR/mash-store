import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Product API Services ────────────────────────────────────────────────

export async function getAllProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });
    return { data: products, error: null };
  } catch (err) {
    console.error("getAllProducts error:", err);
    return { data: null, error: err.message };
  }
}

export async function addNewProduct(body) {
  const { name, price, qty, fit, image, tags, description } = body;

  if (!name || name.trim() === "") {
    return { data: null, error: "Product name is required" };
  }
  if (price === undefined || isNaN(price) || price < 0) {
    return { data: null, error: "Price must be a valid non-negative number" };
  }
  if (qty === undefined || isNaN(qty) || qty < 0) {
    return { data: null, error: "Quantity must be a valid non-negative number" };
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        basePrice: parseInt(price),
        qty: parseInt(qty),
        fit: fit || "Regular",
        image: image || "",
        tags: Array.isArray(tags) ? tags : (tags ? tags.split(",") : []),
        description: description ? description.trim() : "",
      },
    });
    return { data: newProduct, error: null };
  } catch (err) {
    console.error("addNewProduct error:", err);
    return { data: null, error: err.message };
  }
}

export async function updateProduct(id, body) {
  const { qty, basePrice, fit, tags, description } = body;
  const data = {};

  if (qty !== undefined) {
    if (isNaN(qty) || qty < 0) {
      return { data: null, error: "Quantity must be a non-negative number" };
    }
    data.qty = Math.max(0, parseInt(qty));
  }

  if (basePrice !== undefined) {
    if (isNaN(basePrice) || basePrice < 0) {
      return { data: null, error: "Price must be a non-negative number" };
    }
    data.basePrice = parseInt(basePrice);
  }

  if (fit !== undefined) data.fit = fit;
  if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
  if (description !== undefined) data.description = description.trim();

  if (Object.keys(data).length === 0) {
    return { data: null, error: "No valid fields to update" };
  }

  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data,
    });
    return { data: updated, error: null };
  } catch (err) {
    if (err.code === "P2025") {
      return { data: null, error: `Product with id ${id} not found` };
    }
    console.error(`updateProduct error:`, err);
    return { data: null, error: err.message };
  }
}

export async function removeProduct(id) {
  try {
    const deleted = await prisma.product.delete({
      where: { id: parseInt(id) },
    });
    return { data: { success: true, deleted }, error: null };
  } catch (err) {
    if (err.code === "P2025") {
      return { data: null, error: `Product with id ${id} not found` };
    }
    console.error(`removeProduct error:`, err);
    return { data: null, error: err.message };
  }
}
