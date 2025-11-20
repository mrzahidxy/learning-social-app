import prisma from "$lib/server/prisma";
import { error } from "@sveltejs/kit";

export const ensureRole = async (
	userId: string | undefined | null,
	minimumRole: 'READER' | 'AUTHOR' | 'ADMIN'
) => {
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const profile = await prisma.profile.findUnique({
		where: { userId },
		select: { role: true }
	});

	if (!profile) {
		throw error(403, 'Forbidden');
	}

	// Define role hierarchy
	const roleHierarchy = {
		READER: 1,
		AUTHOR: 2,
		ADMIN: 3
	};

	// Check if user's role meets minimum requirement
	if (roleHierarchy[profile.role] < roleHierarchy[minimumRole]) {
		throw error(403, 'Forbidden');
	}
};
