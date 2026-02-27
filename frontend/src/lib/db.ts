/**
 * Prisma Client Singleton — Vercel/Serverless safe
 *
 * In serverless environments (Vercel), each function invocation can
 * create a new module scope. Without this singleton pattern, every
 * request would open a new DB connection, exhausting the pool quickly.
 *
 * Using global to persist the client across hot-reloads in development
 * and to reuse connections across invocations in production.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
