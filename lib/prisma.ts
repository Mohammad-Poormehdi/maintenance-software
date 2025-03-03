import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    return new PrismaClient()
}

// Using type declaration for global scope
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

const prisma = (globalThis as { prisma?: PrismaClient }).prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma

export default prisma 