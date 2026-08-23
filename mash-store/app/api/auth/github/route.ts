// app/api/auth/github/route.ts — Initiates GitHub OAuth Flow
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const { origin } = new URL(req.url);
  const redirectUri = `${origin}/api/auth/callback/github`;

  if (!clientId) {
    return NextResponse.redirect(`${origin}/?oauth_error=github_client_id_missing`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "read:user user:email",
  });

  return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}
