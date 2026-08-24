import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, AdminSessionData } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const expectedPass = process.env.ADMIN_PASSWORD;

    if (!expectedPass) {
      return NextResponse.json({ error: "Authentication configuration error" }, { status: 500 });
    }

    if (!password || password !== expectedPass) {
      return NextResponse.json({ error: "Incorrect admin password" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AdminSessionData>(cookieStore, sessionOptions);
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
