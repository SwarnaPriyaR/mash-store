// app/api/orders/updateOrder/[id]/route.ts — Update Order Payment Status & Order Status
import { NextResponse } from "next/server";
import { updateOrderDetails } from "@/lib/db";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const body = await req.json();

    const updated = await updateOrderDetails(id, {
      status: body.status,
      orderStatus: body.orderStatus,
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Failed to update order:", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
