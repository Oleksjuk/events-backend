import { PrismaClient } from '@prisma/client'

BigInt.prototype['toJSON'] = function () { 
    return this.toString()
}

const prismaClient = new PrismaClient()

export { prismaClient }