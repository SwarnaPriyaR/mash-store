// app/api/kids/updateProduct/[id]/route.ts
import { NextResponse } from "next/server";
import { updateKidsProduct } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kids product id" }, { status: 400 });
    }

    const body = await req.json();
    const { qty, basePrice, sizes, name, image, tags, description } = body;
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
    if (sizes !== undefined) data.sizes = Array.isArray(sizes) ? sizes : [];
    if (name !== undefined) data.name = String(name).trim();
    if (image !== undefined) data.image = String(image).trim();
    if (tags !== undefined) data.tags = Array.isArray(tags) ? tags : [];
    if (description !== undefined) data.description = String(description).trim();

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await updateKidsProduct(id, data);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/kids/updateProduct error:", err);
    return NextResponse.json({ error: "Failed to update kids product" }, { status: 500 });
  }
}
