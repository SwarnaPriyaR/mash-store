import { NextResponse } from "next/server";
import { updateProduct, deleteProduct } from "@/lib/db";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const product = await updateProduct(parseInt(id), body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

export async function DELETE(_req, { params }) {
  try {
    const { id } = await params;
    const result = await deleteProduct(parseInt(id));
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 404 });
  }
}
