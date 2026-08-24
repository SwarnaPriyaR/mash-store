import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expectedPass = process.env.ADMIN_PASSWORD || "mash123";

    if (!password || password !== expectedPass) {
      return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
    }

    // Generate secure session token hash
    const sessionToken = crypto.createHash("sha256").update(`${expectedPass}_mash_secret_salt`).digest("hex");

    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return NextResponse.json({ success: true, message: "Admin authenticated" });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Authentication failed", detail: String(err) }, { status: 500 });
  }
}
