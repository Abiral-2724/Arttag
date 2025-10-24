import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const client =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'], // optional, for debugging
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client;

export default client;
