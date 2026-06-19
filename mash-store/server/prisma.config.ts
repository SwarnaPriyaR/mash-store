/**
 * prisma.config.ts — Prisma 7 configuration file.
 * The Prisma CLI (db push, migrate, studio) reads this file via jiti (no TS compile needed).
 *
 * Docs: https://pris.ly/d/config-datasource
 */
import "dotenv/config";
import { defineConfig } from "prisma/config";


export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasourceUrl: process.env["DATABASE_URL"],
});
