import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

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

export const POST: RequestHandler = async ({ params, request, locals }) => {
	await ensureAdmin(locals.user?.id ?? null);

	const body = await request.json();
	const nextState = body?.published;

	if (typeof nextState !== 'boolean') {
		throw error(400, 'Invalid payload');
	}

	const article = await prisma.article.findUnique({
		where: { id: params.id },
		select: { id: true }
	});

	if (!article) {
		throw error(404, 'Article not found');
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
