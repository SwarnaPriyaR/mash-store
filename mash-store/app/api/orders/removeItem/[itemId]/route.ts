// app/api/orders/removeItem/[itemId]/route.ts — Delete an order line item from an order
import { NextResponse } from "next/server";
import { deleteOrderItem } from "@/lib/db";

export async function DELETE(req: Request, props: { params: Promise<{ itemId: string }> }) {
  try {
    const { itemId } = await props.params;
    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const updated = await deleteOrderItem(itemId);
    if (!updated) {
      return NextResponse.json({ error: "Failed to delete order item" }, { status: 400 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (err) {
    console.error("Failed to delete order item:", err);
    return NextResponse.json({ error: "Failed to delete order item" }, { status: 500 });
  }
}
