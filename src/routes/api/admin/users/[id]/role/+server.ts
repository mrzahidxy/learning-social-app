import type { Role } from '@prisma/client';
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAdmin } from '$lib/server/auth/authorization';
import { isValidRole } from '$lib/server/auth/profile';

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const parseRole = (value: unknown): Role => {
	if (!isValidRole(value)) {
		throw error(400, 'Invalid role');
	}

	return value;
};

const parseUserId = (value: string) => {
	if (!UUID_PATTERN.test(value)) {
		throw error(400, 'Invalid user ID');
	}

	return value;
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const actor = await requireAdmin(locals.user?.id ?? null);
	const targetUserId = parseUserId(params.id);

	let body: { role?: unknown };

	try {
		body = (await request.json()) as { role?: unknown };
	} catch {
		throw error(400, 'Request body must be valid JSON');
	}

	const nextRole = parseRole(body.role);

	const targetProfile = await prisma.profile.findUnique({
		where: { userId: targetUserId },
		select: { userId: true, role: true }
	});

	if (!targetProfile) {
		throw error(404, 'Profile not found');
	}

	if (targetProfile.role === nextRole) {
		return json({ userId: targetProfile.userId, role: targetProfile.role });
	}

	if (actor.userId === targetUserId && targetProfile.role === 'ADMIN' && nextRole !== 'ADMIN') {
		const adminCount = await prisma.profile.count({
			where: { role: 'ADMIN' }
		});

		if (adminCount <= 1) {
			throw error(403, 'Cannot remove the final remaining admin');
		}
	}

	const updated = await prisma.profile.update({
		where: { userId: targetUserId },
		data: { role: nextRole },
		select: { userId: true, role: true }
	});

	return json(updated);
};
