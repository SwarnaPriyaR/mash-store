import { SessionOptions } from "iron-session";
import { env } from "@/lib/env";

export interface AdminSessionData {
  isLoggedIn?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: env.ADMIN_SECRET_SALT,
  cookieName: env.ADMIN_SESSION_COOKIE_NAME,
  cookieOptions: {
    secure: env.ADMIN_COOKIE_SECURE,
    httpOnly: env.ADMIN_COOKIE_HTTP_ONLY,
    sameSite: env.ADMIN_COOKIE_SAME_SITE,
    path: env.ADMIN_COOKIE_PATH,
    maxAge: env.ADMIN_COOKIE_MAX_AGE,
  },
};
