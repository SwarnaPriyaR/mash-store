// app/api/orders/allOrder/route.ts — Fetch all orders
import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/db";

export async function GET() {
  const orders = await getAllOrders();
  return NextResponse.json(orders);
}
