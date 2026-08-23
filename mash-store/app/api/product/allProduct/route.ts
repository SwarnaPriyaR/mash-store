// app/api/product/allProduct/route.ts
// GET /api/product/allProduct — returns all products from Neon PostgreSQL

import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/db";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/product/allProduct error:", err);
    return NextResponse.json(
      { error: "Failed to fetch products", detail: String(err) },
      { status: 500 }
    );
  }
}
