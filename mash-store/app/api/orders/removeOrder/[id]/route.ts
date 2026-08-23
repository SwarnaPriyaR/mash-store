// app/api/orders/removeOrder/[id]/route.ts — Delete an order by ID
import { NextResponse } from "next/server";
import { deleteOrder } from "@/lib/db";

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    await deleteOrder(id);
    return NextResponse.json({ success: true, message: `Order ${id} deleted` });
  } catch (err) {
    console.error("Failed to delete order:", err);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
