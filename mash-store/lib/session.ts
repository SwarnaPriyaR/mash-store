import { SessionOptions } from "iron-session";

export interface AdminSessionData {
  isLoggedIn?: boolean;
}

// 1. Strict Validation of Secret Salt / Password (must be >= 32 characters for iron-session AES-256)
const rawSecret = process.env.ADMIN_SECRET_SALT || process.env.ADMIN_PASSWORD;

if (!rawSecret) {
  throw new Error("SECURITY EXCEPTION: Neither ADMIN_SECRET_SALT nor ADMIN_PASSWORD environment variable is configured.");
}

if (rawSecret.length < 32) {
  throw new Error(`SECURITY EXCEPTION: ADMIN_SECRET_SALT (or ADMIN_PASSWORD) must be at least 32 characters long. Provided length: ${rawSecret.length}.`);
}

// 2. Strict Validation of Cookie Options from environment variables without fallbacks
const cookieName = process.env.ADMIN_SESSION_COOKIE_NAME;
if (!cookieName) {
  throw new Error("SECURITY EXCEPTION: ADMIN_SESSION_COOKIE_NAME environment variable is missing.");
}

const secureEnv = process.env.ADMIN_COOKIE_SECURE;
if (secureEnv !== "true" && secureEnv !== "false") {
  throw new Error("SECURITY EXCEPTION: ADMIN_COOKIE_SECURE environment variable must be set to 'true' or 'false'.");
}

const httpOnlyEnv = process.env.ADMIN_COOKIE_HTTP_ONLY;
if (httpOnlyEnv !== "true" && httpOnlyEnv !== "false") {
  throw new Error("SECURITY EXCEPTION: ADMIN_COOKIE_HTTP_ONLY environment variable must be set to 'true' or 'false'.");
}

const sameSiteEnv = process.env.ADMIN_COOKIE_SAME_SITE;
if (sameSiteEnv !== "strict" && sameSiteEnv !== "lax" && sameSiteEnv !== "none") {
  throw new Error("SECURITY EXCEPTION: ADMIN_COOKIE_SAME_SITE environment variable must be set to 'strict', 'lax', or 'none'.");
}

const cookiePath = process.env.ADMIN_COOKIE_PATH;
if (!cookiePath) {
  throw new Error("SECURITY EXCEPTION: ADMIN_COOKIE_PATH environment variable is missing.");
}

const maxAgeEnv = process.env.ADMIN_COOKIE_MAX_AGE;
if (!maxAgeEnv || isNaN(parseInt(maxAgeEnv, 10))) {
  throw new Error("SECURITY EXCEPTION: ADMIN_COOKIE_MAX_AGE environment variable must be a valid numeric string in seconds.");
}

export const sessionOptions: SessionOptions = {
  password: rawSecret,
  cookieName: cookieName,
  cookieOptions: {
    secure: secureEnv === "true",
    httpOnly: httpOnlyEnv === "true",
    sameSite: sameSiteEnv as "strict" | "lax" | "none",
    path: cookiePath,
    maxAge: parseInt(maxAgeEnv, 10),
  },
};
