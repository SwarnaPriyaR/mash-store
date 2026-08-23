// app/api/kids/allProduct/route.ts
import { NextResponse } from "next/server";
import { getAllKidsProducts } from "@/lib/db";

export async function GET() {
  try {
    const products = await getAllKidsProducts();
    return NextResponse.json(products);
  } catch (err) {
    console.error("GET /api/kids/allProduct error:", err);
    return NextResponse.json({ error: "Failed to fetch kids products" }, { status: 500 });
  }
}
