import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, AdminSessionData } from "@/lib/session";

export async function GET() {
  try {
    const expectedPass = process.env.ADMIN_PASSWORD;
    if (!expectedPass) {
      return NextResponse.json({ authed: false });
    }

    const cookieStore = await cookies();
    const session = await getIronSession<AdminSessionData>(cookieStore, sessionOptions);

    if (session.isLoggedIn === true) {
      return NextResponse.json({ authed: true });
    }

    return NextResponse.json({ authed: false });
  } catch {
    return NextResponse.json({ authed: false });
  }
}
