import { getAllProducts, addNewProduct } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET /api/product
export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/product
export async function POST(req) {
  try {
    const body = await req.json();
    const product = await addNewProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
