/**
 * prisma.config.ts — Prisma 7 configuration file.
 * The Prisma CLI (db push, migrate, studio) reads this file via jiti (no TS compile needed).
 *
 * Docs: https://pris.ly/d/config-datasource
 */
import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Explicitly load .env so DATABASE_URL is available to Prisma CLI
config();

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasourceUrl: process.env["DATABASE_URL"],
});
