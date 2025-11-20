import type { Prisma } from '@prisma/client';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';


const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ locals, url }) => {
	const searchParams = url.searchParams;
	const page = Math.max(Number.parseInt(searchParams.get('page') ?? '1', 10) || 1, 1);
	const search = searchParams.get('q')?.trim() ?? '';
	const status = (searchParams.get('status') ?? 'all') as 'all' | 'published' | 'draft';

	const where: Prisma.ArticleWhereInput = {
		authorUserId: locals.user?.id,
		...(search && {
			OR: [
				{ title: { contains: search, mode: 'insensitive' } },
				{ content: { contains: search, mode: 'insensitive' } }
			]
		}),
		...(status === 'published' && { published: true }),
		...(status === 'draft' && { published: false })
	};

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
				updatedAt: true,
				author: {
					select: {
						userId: true,
						displayName: true
					}
				}
			}
		}),
		prisma.article.count({ where })
	]);

	return {
		articles: articles.map((article) => ({
			...article,
			author: article.author ?? null
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
