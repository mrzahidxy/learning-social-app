import { error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

const ensureAdmin = async (userId: string | undefined | null) => {
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const profile = await prisma.profile.findUnique({
		where: { userId },
		select: { role: true }
	});

	if (profile?.role !== 'ADMIN') {
		throw error(403, 'Forbidden');
	}
};

export const load: PageServerLoad = async ({ locals, url }) => {
	await ensureAdmin(locals.user?.id ?? null);

	const page = Math.max(Number(url.searchParams.get('page') ?? 1), 1);
	const search = url.searchParams.get('q')?.trim() ?? '';
	const status = url.searchParams.get('status') ?? 'all';

	const where: Record<string, unknown> = {};
	if (search) {
		Object.assign(where, {
			OR: [
				{ title: { contains: search, mode: 'insensitive' as const } },
				{ content: { contains: search, mode: 'insensitive' as const } }
			]
		});
	}

	if (status === 'published') {
		Object.assign(where, { published: true });
	} else if (status === 'draft') {
		Object.assign(where, { published: false });
	}

	const [articles, total] = await Promise.all([
		prisma.article.findMany({
			where,
			orderBy: { updatedAt: 'desc' },
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				id: true,
				title: true,
				published: true,
				authorUserId: true,
				createdAt: true,
				updatedAt: true
			}
		}),
		prisma.article.count({ where })
	]);

	const authorIds = Array.from(new Set(articles.map((article) => article.authorUserId)));
	const authors = authorIds.length
		? await prisma.profile.findMany({
				where: { userId: { in: authorIds } },
				select: { userId: true, displayName: true }
			})
		: [];

	const authorMap = new Map(authors.map((author) => [author.userId, author]));

	return {
		articles: articles.map((article) => ({
			...article,
			author: authorMap.get(article.authorUserId) ?? null
		})),
		pagination: {
			page,
			pageSize: PAGE_SIZE,
			total
		},
		filters: {
			search,
			status
		}
	};
};
