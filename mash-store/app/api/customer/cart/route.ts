// app/api/customer/cart/route.ts — Fetch & Sync Customer Cart in DB
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerCart, saveCustomerCart } from "@/lib/db";

async function getSessionEmail() {
  const cookieStore = await cookies();
  const session = cookieStore.get("mash_oauth_session");
  if (!session || !session.value) return null;
  try {
    const data = JSON.parse(session.value);
    return data.email || data.id || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const customerId = await getSessionEmail();
  if (!customerId) {
    return NextResponse.json({ authenticated: false, items: [] });
  }

  const items = await getCustomerCart(customerId);
  return NextResponse.json({ authenticated: true, customerId, items });
}

export async function POST(req: Request) {
  const customerId = await getSessionEmail();
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items = body.items || []; // [{ productId, qty, size, isKids }]

    await saveCustomerCart(customerId, items);
    return NextResponse.json({ success: true, count: items.length });
  } catch (err) {
    console.error("Cart sync error:", err);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}
