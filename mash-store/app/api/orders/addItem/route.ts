// app/api/orders/addItem/route.ts — Add an order item directly to an existing order
import { NextResponse } from "next/server";
import { addOrderItemToOrder } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, productId, productName, size, quantity, unitPrice, isKids } = body;

    if (!orderId || !productId || !productName) {
      return NextResponse.json({ error: "orderId, productId, and productName are required" }, { status: 400 });
    }

    const updated = await addOrderItemToOrder(orderId, {
      productId: Number(productId),
      productName: String(productName),
      size: String(size || "S"),
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
      isKids: Boolean(isKids),
    });

    if (!updated) {
      return NextResponse.json({ error: "Failed to add item to order" }, { status: 500 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("Failed to add item to order:", err);
    return NextResponse.json({ error: "Failed to add order item" }, { status: 500 });
  }
}
