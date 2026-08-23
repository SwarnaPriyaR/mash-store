// app/api/orders/updateOrder/[id]/route.ts — Update Order Payment Status
import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/db";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: "status is required" }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, body.status);
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update order status:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
