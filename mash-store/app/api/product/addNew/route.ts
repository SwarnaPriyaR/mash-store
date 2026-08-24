// app/api/product/addNew/route.ts
// POST /api/product/addNew — creates a new product

import { NextResponse } from "next/server";
import { createProduct } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, basePrice, qty, fit, category, image, tags, description } = body;

    // Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    const parsedPrice = parseInt(basePrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "basePrice must be a positive integer (INR)" }, { status: 400 });
    }
    const parsedQty = parseInt(qty);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return NextResponse.json({ error: "qty must be a non-negative integer" }, { status: 400 });
    }
    if (!image || typeof image !== "string" || !image.trim()) {
      return NextResponse.json({ error: "image URL is required" }, { status: 400 });
    }

    const product = await createProduct({
      name: name.trim(),
      basePrice: parsedPrice,
      qty: parsedQty,
      fit: fit || "Regular",
      category: category || "Men T-Shirt",
      image: convertDriveUrl(image.trim()),
      tags: Array.isArray(tags) ? tags : [],
      description: typeof description === "string" ? description.trim() : "",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("POST /api/product/addNew error:", err);
    return NextResponse.json(
      { error: "Failed to create product", detail: String(err) },
      { status: 500 }
    );
  }
}
