import { fail } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { ensureRole } from '$lib/features/user/utils/ensureRole';
import type { Actions, PageServerLoad } from './$types';
import type { Role } from '@prisma/client';

const sanitize = (value: string | null) => value?.trim() ?? '';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? null;
	await ensureRole(userId, 'READER');

	const profile = await prisma.profile.findUnique({
		where: { userId: userId! },
		select: {
			displayName: true,
			bio: true,
			role: true,
			profileImage: true
		}
	});

	return {
		profile: profile ?? null
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id ?? null;
		await ensureRole(userId, 'READER');

		const formData = await request.formData();
		const displayName = sanitize(formData.get('displayName') as string | null);
		const bio = sanitize(formData.get('bio') as string | null);
		const profileImageUrl = sanitize(formData.get('profileImageUrl') as string | null);
		const requestedRoleInput = sanitize(formData.get('requestedRole') as string | null).toUpperCase();

		if (!displayName) {
			return fail(400, { formError: 'Display name is required', field: 'displayName' });
		}

		const requestedRole: Role = requestedRoleInput === 'AUTHOR' ? 'AUTHOR' : 'READER';

		const profile = await prisma.profile.upsert({
			where: { userId: userId! },
			update: {
				displayName,
				bio: bio || null,
				profileImage: profileImageUrl || null,
				role: requestedRole
			},
			create: {
				userId: userId!,
				displayName,
				bio: bio || null,
				profileImage: profileImageUrl || null,
				role: requestedRole
			}
		});

		return {
			profile: {
				displayName: profile.displayName,
				bio: profile.bio,
				role: profile.role,
				profileImage: profile.profileImage
			}
		};
	}
};
