// app/api/auth/callback/google/route.ts — Handles Google OAuth Callback & Customer DB logic
import { NextResponse } from "next/server";
import { findCustomerByEmail, createCustomer } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const intent = searchParams.get("state") || "login";
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${origin}/?oauth_error=${error || "no_code"}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/callback/google`;

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) {
      throw new Error(tokens.error_description || "Token exchange failed");
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await userRes.json();
    const email = profile.email;
    const name = profile.name || email.split("@")[0];
    const image = profile.picture || "";

    // 3. Check customer DB record
    const existingCustomer = await findCustomerByEmail(email);

    if (intent === "signup" && existingCustomer) {
      // User clicked Sign Up but account already exists -> Redirect with account_exists error
      return NextResponse.redirect(`${origin}/?oauth_error=account_exists`);
    }

    if (intent === "login" && !existingCustomer) {
      // User clicked Log In but account does not exist -> Redirect with account_not_found error
      return NextResponse.redirect(`${origin}/?oauth_error=account_not_found`);
    }

    // If new user signing up, create Customer in DB
    if (!existingCustomer) {
      await createCustomer(email, name, image);
    }

    const userSession = {
      id: email, // Customer ID = Email
      name: existingCustomer ? existingCustomer.name : name,
      email,
      image,
      provider: "google",
    };

    // 4. Set HTTP cookie and redirect
    const res = NextResponse.redirect(`${origin}/?login_success=google`);
    res.cookies.set("mash_oauth_session", JSON.stringify(userSession), {
      httpOnly: false,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/?oauth_error=token_exchange_failed`);
  }
}
