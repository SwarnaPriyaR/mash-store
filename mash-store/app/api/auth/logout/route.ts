// app/api/auth/logout/route.ts — Clears OAuth Session Cookie
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true, message: "Logged out successfully" });
  res.cookies.delete("mash_oauth_session");
  return res;
}
