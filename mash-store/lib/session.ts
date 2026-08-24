import { SessionOptions } from "iron-session";

export interface AdminSessionData {
  isLoggedIn?: boolean;
}

const secretSalt = process.env.ADMIN_SECRET_SALT || process.env.ADMIN_PASSWORD || "";

// Must be at least 32 characters long for iron-session AES-256 encryption key
const sessionPassword = secretSalt.length >= 32 
  ? secretSalt 
  : (secretSalt + "_SECURITY_HASH_SALT_KEY_ENV_REQUIREMENT").slice(0, 32);

export const sessionOptions: SessionOptions = {
  password: sessionPassword,
  cookieName: process.env.ADMIN_SESSION_COOKIE_NAME || "admin_session",
  cookieOptions: {
    secure: process.env.ADMIN_COOKIE_SECURE === "false" ? false : true,
    httpOnly: process.env.ADMIN_COOKIE_HTTP_ONLY === "false" ? false : true,
    sameSite: (process.env.ADMIN_COOKIE_SAME_SITE as "strict" | "lax" | "none") || "strict",
    path: process.env.ADMIN_COOKIE_PATH || "/",
    maxAge: parseInt(process.env.ADMIN_COOKIE_MAX_AGE || "86400", 10),
  },
};
