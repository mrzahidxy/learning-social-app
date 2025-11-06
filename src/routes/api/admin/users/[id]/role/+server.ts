import { error, json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';

const ROLES = ['READER', 'AUTHOR', 'ADMIN'] as const;

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const { user } = locals;
	if (!user) throw error(401, 'Unauthorized');

	const actor = await prisma.profile.findUnique({
		where: { userId: user.id },
		select: { role: true }
	});
	if (actor?.role !== 'ADMIN') throw error(403, 'Forbidden');

	const body = await request.json();
	if (!ROLES.includes(body.role)) throw error(400, 'Invalid role');

	const targetProfile = await prisma.profile.findUnique({
		where: { userId: params.id }
	});

	const updated = await prisma.profile.upsert({
		where: { userId: params.id },
		create: {
			userId: params.id,
			role: body.role,
			displayName: targetProfile?.displayName ?? null,
			bio: targetProfile?.bio ?? null,
			profileImage: targetProfile?.profileImage ?? null
		},
		update: { role: body.role }
	});

	return json({ role: updated.role });
};
