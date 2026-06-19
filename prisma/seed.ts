import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DEMO_ARTICLE_ID = '00000000-0000-4000-8000-000000000001';

async function main() {
	const adminUserId = process.env.SEED_ADMIN_USER_ID?.trim();

	if (!adminUserId) {
		throw new Error('SEED_ADMIN_USER_ID is required. Set it to an existing Supabase Auth user ID.');
	}

	if (!UUID_PATTERN.test(adminUserId)) {
		throw new Error('SEED_ADMIN_USER_ID must be a valid UUID.');
	}

	const admin = await prisma.profile.upsert({
		where: { userId: adminUserId },
		create: {
			userId: adminUserId,
			role: 'ADMIN',
			displayName: 'Project Admin'
		},
		update: {
			role: 'ADMIN'
		},
		select: {
			userId: true,
			role: true,
			displayName: true
		}
	});

	const article = await prisma.article.upsert({
		where: { id: DEMO_ARTICLE_ID },
		create: {
			id: DEMO_ARTICLE_ID,
			authorUserId: admin.userId,
			title: 'Welcome to the Learning Community',
			content:
				'This demo article introduces the learning community. Authors can publish practical lessons, share useful resources, and help readers learn together.',
			published: true
		},
		update: {
			authorUserId: admin.userId,
			title: 'Welcome to the Learning Community',
			content:
				'This demo article introduces the learning community. Authors can publish practical lessons, share useful resources, and help readers learn together.',
			published: true
		},
		select: {
			id: true,
			title: true
		}
	});

	console.log(`Seeded admin profile for ${admin.displayName ?? admin.userId} (${admin.userId}).`);
	console.log(`Seeded demo article "${article.title}" (${article.id}).`);
}

main()
	.catch((error) => {
		console.error('Seed failed:', error instanceof Error ? error.message : error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
