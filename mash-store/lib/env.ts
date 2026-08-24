import { z } from "zod";

/**
 * Enterprise Engineering Standard Environment Variable Schema
 * Validates all required auth, session, and database environment variables
 */
const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "DATABASE_URL is required"),

  ADMIN_PASSWORD: z
    .string()
    .min(1, "ADMIN_PASSWORD is required"),

  ADMIN_SECRET_SALT: z
    .string()
    .min(32, "ADMIN_SECRET_SALT must be at least 32 characters long for AES-256 session encryption"),

  ADMIN_SESSION_COOKIE_NAME: z
    .string()
    .min(1, "ADMIN_SESSION_COOKIE_NAME is required"),

  ADMIN_COOKIE_SECURE: z
    .enum(["true", "false"])
    .transform((val) => val === "true"),

  ADMIN_COOKIE_HTTP_ONLY: z
    .enum(["true", "false"])
    .transform((val) => val === "true"),

  ADMIN_COOKIE_SAME_SITE: z
    .enum(["strict", "lax", "none"]),

  ADMIN_COOKIE_PATH: z
    .string()
    .min(1, "ADMIN_COOKIE_PATH is required"),

  ADMIN_COOKIE_MAX_AGE: z
    .string()
    .transform((val, ctx) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ADMIN_COOKIE_MAX_AGE must be a positive integer in seconds",
        });
        return z.NEVER;
      }
      return parsed;
    }),
});

/**
 * Safely parse environment variables or throw structured validation exception
 */
function getValidatedEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((issue) => ` - [${issue.path.join(".")}]: ${issue.message}`)
      .join("\n");
    throw new Error(`CRITICAL ENVIRONMENT CONFIGURATION ERROR:\n${formattedErrors}`);
  }
  return result.data;
}

export const env = getValidatedEnv();
