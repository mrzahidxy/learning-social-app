import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import prisma from '$lib/server/prisma';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { id } = params;

	const article = await prisma.article.findFirst({
		where: {
			id: id,
			published: true
		},

		select: {
			id: true,
			title: true,
			content: true,
			imageUrl: true,
			published: true,
			authorUserId: true,
			createdAt: true,
			updatedAt: true,
			author: {
				select: {
					userId: true,
					displayName: true,
					role: true,
					bio: true,
					profileImage: true,
					createdAt: true,
					updatedAt: true
				}
			}
		}
	});

	if (!article) {
		throw error(404, 'Article not found');
	}

	// Get author stats
	const [totalArticles, totalSubscribers, relatedArticles] = await Promise.all([
		prisma.article.count({
			where: {
				authorUserId: article.authorUserId,
				published: true
			}
		}),
		prisma.subscription.count({
			where: {
				authorUserId: article.authorUserId
			}
		}),
		prisma.article.findMany({
			where: {
				authorUserId: article.authorUserId,
				published: true,
				NOT: { id: id }
			},
			orderBy: {
				updatedAt: 'desc'
			},
			take: 3,
			select: {
				id: true,
				title: true,
				content: true,
				imageUrl: true,
				published: true,
				authorUserId: true,
				createdAt: true,
				updatedAt: true,
				author: {
					select: {
						userId: true,
						displayName: true,
						role: true,
						bio: true,
						profileImage: true,
						createdAt: true,
						updatedAt: true
					}
				}
			}
		})
	]);

	return {
		article,
		author: article.author,
		relatedArticles,
		authorStats: { totalArticles, totalSubscribers }
	};
};
