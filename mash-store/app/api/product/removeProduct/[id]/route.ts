// app/api/product/removeProduct/[id]/route.ts
// DELETE /api/product/removeProduct/:id — permanently deletes a product

import { NextResponse } from "next/server";
import { deleteProduct } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
    }

    const deleted = await deleteProduct(id);
    return NextResponse.json({ success: true, deleted });
  } catch (err: unknown) {
    const prismaErr = err as { code?: string };
    if (prismaErr?.code === "P2025") {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    console.error("DELETE /api/product/removeProduct error:", err);
    return NextResponse.json(
      { error: "Failed to delete product", detail: String(err) },
      { status: 500 }
    );
  }
}
