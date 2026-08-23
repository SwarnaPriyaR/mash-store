// app/api/orders/addNew/route.ts — Create a new order (manual or automated)
import { NextResponse } from "next/server";
import { createOrder } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.customerId || typeof body.totalAmount !== "number") {
      return NextResponse.json({ error: "customerId and totalAmount are required" }, { status: 400 });
    }

    let orderId = body.id ? String(body.id).trim() : "";
    if (orderId && !orderId.toUpperCase().startsWith("O")) {
      orderId = `O-${orderId}`;
    }
    if (!orderId) {
      orderId = `O-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const order = await createOrder({
      id: orderId,
      customerId: body.customerId,
      totalAmount: body.totalAmount,
      status: body.status || "Not Paid",
      orderStatus: body.orderStatus || "Order Received",
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error("Failed to create order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
