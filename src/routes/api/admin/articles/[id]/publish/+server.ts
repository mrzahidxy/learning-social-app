import type { Prisma } from '@prisma/client';
import { NotificationType } from '@prisma/client';
import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid payload');
	}

	const nextState = (body as { published?: unknown })?.published;

	if (typeof nextState !== 'boolean') {
		throw error(400, 'Invalid payload');
	}

	const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
		const actor = await tx.profile.findUnique({
			where: { userId },
			select: { role: true }
		});

		const article = await tx.article.findUnique({
			where: { id: params.id },
			select: {
				id: true,
				title: true,
				published: true,
				authorUserId: true,
				author: {
					select: {
						displayName: true
					}
				}
			}
		});

		if (!article) {
			throw error(404, 'Article not found');
		}

		const isAdmin = actor?.role === 'ADMIN';
		if (!isAdmin && userId !== article.authorUserId) {
			throw error(403, 'You are not authorized');
		}

		const shouldFanOut = article.published === false && nextState === true;

		const savedArticle = await tx.article.update({
			where: { id: params.id },
			data: { published: nextState },
			select: {
				id: true,
				published: true,
				updatedAt: true
			}
		});

		if (shouldFanOut) {
			const subscriptions = await tx.subscription.findMany({
				where: {
					authorUserId: article.authorUserId,
					NOT: {
						userId: article.authorUserId
					}
				},
				select: {
					userId: true
				}
			});

			if (subscriptions.length > 0) {
				const authorName = article.author.displayName?.trim() || 'An author';
				const message = `${authorName} published "${article.title}"`;

				await tx.notification.createMany({
					data: subscriptions.map((subscription) => ({
						userId: subscription.userId,
						articleId: article.id,
						type: NotificationType.ARTICLE_PUBLISHED,
						message
					})),
					skipDuplicates: true
				});
			}
		}

		return savedArticle;
	});

	return json(updated);
};
