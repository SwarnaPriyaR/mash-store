/**
 * prisma.config.ts — Prisma 7 configuration file.
 * Prisma CLI reads this via jiti (no TS compilation needed).
 * Docs: https://pris.ly/d/config-datasource
 */

// Side-effect import: loads .env into process.env immediately
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasourceUrl: process.env["DATABASE_URL"],
});
