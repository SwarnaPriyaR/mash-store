// app/api/auth/callback/github/route.ts — Handles GitHub OAuth Callback
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?oauth_error=${error || "no_code"}`);
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      throw new Error(tokens.error_description || "Token exchange failed");
    }

    // 2. Fetch user profile from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${tokens.access_token}`,
        "User-Agent": "MASH-Store-NextJS",
      },
    });
    const profile = await userRes.json();

    const userSession = {
      name: profile.name || profile.login,
      email: profile.email || `${profile.login}@users.noreply.github.com`,
      image: profile.avatar_url || "",
      provider: "github",
    };

    // 3. Set cookie and redirect
    const res = NextResponse.redirect(`${origin}/?login_success=github`);
    res.cookies.set("mash_oauth_session", JSON.stringify(userSession), {
      httpOnly: false,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/?oauth_error=token_exchange_failed`);
  }
}
