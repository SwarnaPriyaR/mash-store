// app/api/kids/addNew/route.ts
import { NextResponse } from "next/server";
import { createKidsProduct } from "@/lib/db";
import { convertDriveUrl } from "@/lib/helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, basePrice, qty, sizes, image, tags, description } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    const parsedPrice = parseInt(basePrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ error: "basePrice must be > 0" }, { status: 400 });
    }
    const parsedQty = parseInt(qty);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return NextResponse.json({ error: "qty must be >= 0" }, { status: 400 });
    }
    if (!image || typeof image !== "string" || !image.trim()) {
      return NextResponse.json({ error: "image URL is required" }, { status: 400 });
    }

    const product = await createKidsProduct({
      name: name.trim(),
      basePrice: parsedPrice,
      qty: parsedQty,
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ["2–3 Years", "4–5 Years", "6–7 Years", "8–9 Years"],
      image: convertDriveUrl(image.trim()),
      tags: Array.isArray(tags) ? tags : ["Kids"],
      description: typeof description === "string" ? description.trim() : "",
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error("POST /api/kids/addNew error:", err);
    return NextResponse.json({ error: "Failed to create kids product", detail: String(err) }, { status: 500 });
  }
}
