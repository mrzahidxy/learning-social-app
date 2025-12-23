import type { Prisma } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 6;

export const load: PageServerLoad = async ({ url, locals }) => {
	const searchParams = url.searchParams;
	const requestedPage = Number.parseInt(searchParams.get('page') ?? '1', 10);
	const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
	const search = searchParams.get('q')?.trim() ?? '';
	const sort = searchParams.get('sort') === 'latest' ? 'latest' : 'default';
	const tab = searchParams.get('tab') === 'flows' ? 'flows' : 'home';

	const where: Prisma.ArticleWhereInput = {
		...(search && {
			OR: [
				{ title: { contains: search, mode: 'insensitive' } },
				{ content: { contains: search, mode: 'insensitive' } }
			]
		})
	};

	// For "flows", limit to authors the user follows; require auth.
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
			const followedAuthorIds = follows.map((f) => f.authorUserId);
			where.authorUserId = { in: followedAuthorIds };
		}
	}

	const totalItems = flowsAuthRequired ? 0 : await prisma.article.count({ where });
	const totalPages = totalItems > 0 ? Math.ceil(totalItems / PAGE_SIZE) : 0;
	const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;

	const articles =
		flowsAuthRequired
			? []
			: await prisma.article.findMany({
					where,
					orderBy: sort === 'latest' ? { updatedAt: 'desc' } : { updatedAt: 'asc' },
					skip: totalPages === 0 ? 0 : (safePage - 1) * PAGE_SIZE,
					take: PAGE_SIZE,
					select: {
						id: true,
						title: true,
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
