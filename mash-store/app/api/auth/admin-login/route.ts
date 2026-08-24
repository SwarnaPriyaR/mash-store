// app/api/auth/admin-login/route.ts — Validate client password against server-side ADMIN_PASSWORD
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const inputPass = String(password || "").trim();

    // Fetch expected password from server-side environment variable ADMIN_PASSWORD
    const expectedPass = (process.env.ADMIN_PASSWORD || "mash123").trim();

    if (inputPass === expectedPass) {
      return NextResponse.json({ success: true, message: "Access Granted" });
    }

    return NextResponse.json({ success: false, error: "Incorrect Password" }, { status: 401 });
  } catch (err) {
    console.error("Failed to validate admin password:", err);
    return NextResponse.json({ success: false, error: "Authentication failed" }, { status: 500 });
  }
}
