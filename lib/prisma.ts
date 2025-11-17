type PrismaClientConstructor = new (...args: any[]) => any

function loadPrismaClient(): PrismaClientConstructor {
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const required = eval('require')('@prisma/client') as { PrismaClient: PrismaClientConstructor }
    if (required?.PrismaClient) {
      return required.PrismaClient
    }
  } catch (error) {
    console.warn('Prisma Client is unavailable in this environment. Falling back to a mock client.')
  }

  class MockPrismaClient {
    post = {
      findMany: async () => [],
      findUnique: async () => null,
      create: async () => {
        throw new Error('Prisma Client is unavailable in this environment.')
      },
      update: async () => {
        throw new Error('Prisma Client is unavailable in this environment.')
      },
      delete: async () => {
        throw new Error('Prisma Client is unavailable in this environment.')
      },
    }
  }

  return MockPrismaClient
}

const PrismaClient = loadPrismaClient()
const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
