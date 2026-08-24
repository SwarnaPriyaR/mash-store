import { SessionOptions } from "iron-session";

export interface AdminSessionData {
  isLoggedIn?: boolean;
}

const defaultPassword = "complex_password_at_least_32_characters_long_for_iron_session";

export const sessionOptions: SessionOptions = {
  password: (process.env.ADMIN_SECRET_SALT && process.env.ADMIN_SECRET_SALT.length >= 32)
    ? process.env.ADMIN_SECRET_SALT
    : defaultPassword,
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  },
};
