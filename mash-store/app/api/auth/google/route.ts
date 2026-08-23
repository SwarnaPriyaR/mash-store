// app/api/auth/google/route.ts — Initiates Google OAuth Flow
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId) {
    // Demo / fallback mode if Client ID is not configured yet
    return NextResponse.redirect(`${origin}/?oauth_error=google_client_id_missing`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
