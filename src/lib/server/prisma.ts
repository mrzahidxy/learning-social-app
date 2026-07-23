import prismaPkg from '@prisma/client';

const { PrismaClient } = prismaPkg;
type PrismaClientInstance = InstanceType<typeof PrismaClient>;

const prisma: PrismaClientInstance = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export default prisma;

declare global {
	// eslint-disable-next-line no-var
	var __prisma: PrismaClientInstance | undefined;
}
