import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import { ensureAdmin } from '$lib/features/admin/utils/ensureAdmin';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userId = locals.user?.id;
	let isAdmin = false;

	try {
		await ensureAdmin(locals.user?.id ?? null);
		isAdmin = true;
	} catch (error) {}

	const article = await prisma.article.findUnique({
		where: { id: params.id },
		select: { id: true, authorUserId: true }
	});

	if (!article) {
		throw error(404, 'Article not found');
	}

	if (!isAdmin && userId !== article.authorUserId) {
		throw error(403, 'You are not authorized');
	}

	const body = await request.json();
	const nextState = body?.published;

	if (typeof nextState !== 'boolean') {
		throw error(400, 'Invalid payload');
	}

	const updated = await prisma.article.update({
		where: { id: params.id },
		data: { published: nextState },
		select: {
			id: true,
			published: true,
			updatedAt: true
		}
	});

	return json(updated);
};
