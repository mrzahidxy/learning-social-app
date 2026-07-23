import type { Role } from '@prisma/client';
import prisma from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export const requireUser = (userId: string | undefined | null) => {
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	return userId;
};

export const getRequiredProfile = async (userId: string | undefined | null) => {
	const ensuredUserId = requireUser(userId);
	const profile = await prisma.profile.findUnique({
		where: { userId: ensuredUserId },
		select: {
			userId: true,
			role: true,
			displayName: true
		}
	});

	if (!profile) {
		throw error(403, 'Forbidden');
	}

	return profile;
};

export const requireRole = async (
	userId: string | undefined | null,
	allowedRoles: Role[] | readonly Role[]
) => {
	const profile = await getRequiredProfile(userId);

	if (!allowedRoles.includes(profile.role)) {
		throw error(403, 'Forbidden');
	}

	return profile;
};

export const requireAdmin = async (userId: string | undefined | null) =>
	requireRole(userId, ['ADMIN']);

export const requireAuthor = async (userId: string | undefined | null) =>
	requireRole(userId, ['AUTHOR', 'ADMIN']);
