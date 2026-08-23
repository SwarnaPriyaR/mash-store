// app/api/product/updateProduct/[id]/route.ts
// PATCH /api/product/updateProduct/:id — partially updates a product

import { NextResponse } from "next/server";
import { updateProduct } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const body = await req.json();
    const { qty, basePrice, fit, name, image, tags, description } = body;
    const data: Record<string, unknown> = {};

    if (qty !== undefined) {
      const v = parseInt(qty);
      if (isNaN(v) || v < 0) return NextResponse.json({ error: "qty must be >= 0" }, { status: 400 });
      data.qty = v;
    }
    if (basePrice !== undefined) {
      const v = parseInt(basePrice);
      if (isNaN(v) || v <= 0) return NextResponse.json({ error: "basePrice must be > 0" }, { status: 400 });
      data.basePrice = v;
    }
    if (fit !== undefined) {
      if (!["Regular", "Oversized"].includes(fit)) {
        return NextResponse.json({ error: "fit must be Regular or Oversized" }, { status: 400 });
      }
      data.fit = fit;
    }
    if (name !== undefined) data.name = String(name).trim();
    if (image !== undefined) data.image = String(image).trim();
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (description !== undefined) data.description = String(description).trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await updateProduct(id, data);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const prismaErr = err as { code?: string; message?: string };
    if (prismaErr?.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("PATCH /api/product/updateProduct error:", err);
    return NextResponse.json(
      { error: "Failed to update product", detail: String(err) },
      { status: 500 }
    );
  }
}
