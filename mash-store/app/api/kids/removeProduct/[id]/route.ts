// app/api/kids/removeProduct/[id]/route.ts
import { NextResponse } from "next/server";
import { deleteKidsProduct } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid kids product id" }, { status: 400 });
    }

    const deleted = await deleteKidsProduct(id);
    return NextResponse.json({ message: "Kids product deleted successfully", product: deleted });
  } catch (err) {
    console.error("DELETE /api/kids/removeProduct error:", err);
    return NextResponse.json({ error: "Failed to delete kids product" }, { status: 500 });
  }
}
