import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => new PrismaClient();

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = db;
