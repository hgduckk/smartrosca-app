import { PrismaClient } from "@prisma/client";

// Singleton Prisma client — tránh tạo nhiều connection khi Next.js hot-reload ở dev.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
