import { error, fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { requireUser } from '$lib/server/auth/authorization';
import { parseProfileForm, updateOwnProfile } from '$lib/server/auth/profile';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = requireUser(locals.user?.id ?? null);

	const profile = await prisma.profile.findUnique({
		where: { userId },
		select: {
			displayName: true,
			bio: true,
			role: true,
			profileImage: true
		}
	});

	if (!profile) {
		throw error(404, 'Profile not found');
	}

	return {
		profile
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = requireUser(locals.user?.id ?? null);

		const formData = await request.formData();
		const parsed = parseProfileForm(formData);
		if (!parsed.data) {
			return fail(400, parsed);
		}

		const profile = await updateOwnProfile(userId, parsed.data);

		return {
			profile: {
				displayName: profile.displayName,
				bio: profile.bio,
				role: profile.role,
				profileImage: profile.profileImage
			},
			values: parsed.values
		};
	}
};
