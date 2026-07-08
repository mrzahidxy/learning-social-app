import type { Prisma } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 9;

export const load: PageServerLoad = async ({ url, locals }) => {
	const searchParams = url.searchParams;
	const pageParam = Number(searchParams.get('page') ?? '1');
	const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
	const search = (searchParams.get('q') ?? '').trim();
	const sort = searchParams.get('sort') === 'latest' ? 'latest' : 'default';
	const tab = searchParams.get('tab') === 'flows' ? 'flows' : 'home';

	const where: Prisma.ArticleWhereInput = {};

	if (search) {
		where.OR = [
			{ title: { contains: search, mode: 'insensitive' } },
			// { content: { contains: search, mode: 'insensitive' } }
		];
	}

	let flowsAuthRequired = false;
	if (tab === 'flows') {
		const userId = locals.user?.id;
		if (!userId) {
			flowsAuthRequired = true;
		} else {
			const follows = await prisma.subscription.findMany({
				where: { userId },
				select: { authorUserId: true }
			});
			where.authorUserId = { in: follows.map((follow) => follow.authorUserId) };
		}
	}

	const totalItems = flowsAuthRequired ? 0 : await prisma.article.count({ where });
	const totalPages = totalItems ? Math.ceil(totalItems / PAGE_SIZE) : 0;
	const safePage = totalPages ? Math.min(page, totalPages) : 1;

	const articles = flowsAuthRequired
		? []
		: await prisma.article.findMany({
				where,
				orderBy: { updatedAt: sort === 'latest' ? 'desc' : 'asc' },
				skip: totalPages ? (safePage - 1) * PAGE_SIZE : 0,
				take: PAGE_SIZE,
				select: {
					id: true,
					title: true,
					content: true,
					published: true,
					authorUserId: true,
					createdAt: true,
					updatedAt: true,
					imageUrl: true,
					author: {
						select: {
							userId: true,
							displayName: true
						}
					}
				}
			});

	return {
		articles: articles.map((article) => ({
			...article,
			author: article.author ?? null
		})),
		pagination: {
			page: safePage,
			pageSize: PAGE_SIZE,
			totalItems,
			totalPages,
			hasNext: totalPages > 0 && safePage < totalPages,
			hasPrev: safePage > 1
		},
		filters: {
			search,
			sort,
			tab
		},
		flowsAuthRequired
	};
};
