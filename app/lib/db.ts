import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

if (
  process.env.NODE_ENV === 'development' &&
  !process.env.DATABASE_URL
) {
  console.warn('DATABASE_URL is not set; database operations will fail.');
}

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Also export as prisma for backward compatibility
export const prisma = db
