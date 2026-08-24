import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function GET() {
  try {
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedPass) {
      return NextResponse.json({ authed: false });
    }

    const expectedToken = crypto.createHash("sha256").update(`${expectedPass}_mash_secret_salt`).digest("hex");

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (token && token === expectedToken) {
      return NextResponse.json({ authed: true });
    }

    return NextResponse.json({ authed: false });
  } catch (err: unknown) {
    return NextResponse.json({ authed: false, error: String(err) });
  }
}
