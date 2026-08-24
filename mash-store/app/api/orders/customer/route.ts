// app/api/orders/customer/route.ts — Fetch orders linked with customer email
import { NextResponse } from "next/server";
import { getCustomerOrders } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || "";

    if (!email.trim()) {
      return NextResponse.json({ orders: [] });
    }

    const orders = await getCustomerOrders(email);
    return NextResponse.json({ orders }, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch customer orders:", err);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
