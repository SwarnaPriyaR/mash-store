// app/api/customer/wishlist/route.ts — Fetch & Sync Customer Wishlist in DB
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCustomerWishlist, saveCustomerWishlist } from "@/lib/db";

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
    return NextResponse.json({ authenticated: false, wishlist: [] });
  }

  const wishlist = await getCustomerWishlist(customerId);
  return NextResponse.json({ authenticated: true, customerId, wishlist });
}

export async function POST(req: Request) {
  const customerId = await getSessionEmail();
  if (!customerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const productIds = body.wishlist || []; // [1, 2, 3]

    await saveCustomerWishlist(customerId, productIds);
    return NextResponse.json({ success: true, count: productIds.length });
  } catch (err) {
    console.error("Wishlist sync error:", err);
    return NextResponse.json({ error: "Failed to save wishlist" }, { status: 500 });
  }
}
