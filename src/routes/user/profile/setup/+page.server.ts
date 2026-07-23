import prisma from '$lib/server/prisma';
import { requireUser } from '$lib/server/auth/authorization';
import {
	PROFILE_SETUP_PATH,
	isProfileComplete,
	parseProfileForm,
	updateOwnProfile
} from '$lib/server/auth/profile';
import { error, fail, redirect } from '@sveltejs/kit';
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

	if (isProfileComplete(profile)) {
		throw redirect(303, '/user/profile');
	}

	return {
		profile,
		profileSetupPath: PROFILE_SETUP_PATH
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

		await updateOwnProfile(userId, parsed.data);
		throw redirect(303, '/user/profile');
	}
};
