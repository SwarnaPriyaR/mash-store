import { updateProduct, removeProduct } from '@/lib/db';
import { NextResponse } from 'next/server';

// PATCH /api/product/[id]
export async function PATCH(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();
    const product = await updateProduct(id, body);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

// DELETE /api/product/[id]
export async function DELETE(req, { params }) {
  try {
    const id = params.id;
    const result = await removeProduct(id);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 404 });
  }
}
