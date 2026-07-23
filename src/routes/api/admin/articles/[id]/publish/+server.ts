import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import { getRequiredProfile, requireUser } from '$lib/server/auth/authorization';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const userId = requireUser(locals.user?.id ?? null);
	const actor = await getRequiredProfile(userId);

	const article = await prisma.article.findUnique({
		where: { id: params.id },
		select: { id: true, authorUserId: true }
	});

	if (!article) {
		throw error(404, 'Article not found');
	}

	if (actor.role !== 'ADMIN') {
		if (actor.role !== 'AUTHOR') {
			throw error(403, 'Forbidden');
		}

		if (userId !== article.authorUserId) {
			throw error(403, 'Forbidden');
		}
	}

	let body: { published?: unknown };

	try {
		body = (await request.json()) as { published?: unknown };
	} catch {
		throw error(400, 'Request body must be valid JSON');
	}

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
