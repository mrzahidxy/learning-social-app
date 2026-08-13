import { fail, isHttpError } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { ensureRole } from '$lib/features/user/utils/ensureRole';
import type { Actions, PageServerLoad } from './$types';
import type { Role } from '@prisma/client';
import { buildAvatarImagePath, removeManagedImage, uploadManagedImage } from '$lib/server/storage';

const sanitize = (value: string | null) => value?.trim() ?? '';
const toFile = (value: FormDataEntryValue | null) =>
	value instanceof File && value.size > 0 ? value : null;
const isChecked = (value: FormDataEntryValue | null) =>
	value === 'true' || value === '1' || value === 'on';

const toFormFailure = (err: unknown, fallbackMessage: string) => {
	if (isHttpError(err)) {
		return fail(err.status, { formError: err.body.message });
	}

	return fail(500, {
		formError: err instanceof Error ? err.message : fallbackMessage
	});
};

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id ?? null;
	await ensureRole(userId, 'READER');

	const profile = await prisma.profile.findUnique({
		where: { userId: userId! },
		select: {
			displayName: true,
			bio: true,
			role: true,
			profileImage: true,
			profileImagePath: true
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

		const existingProfile = await prisma.profile.findUnique({
			where: { userId: userId! },
			select: { profileImage: true, profileImagePath: true }
		});

		const formData = await request.formData();
		const displayName = sanitize(formData.get('displayName') as string | null);
		const bio = sanitize(formData.get('bio') as string | null);
		const requestedRoleInput = sanitize(
			formData.get('requestedRole') as string | null
		).toUpperCase();
		const clearProfileImage = isChecked(formData.get('clearProfileImage'));
		const profileImageFile = toFile(formData.get('profileImage'));

		if (!displayName) {
			return fail(400, { formError: 'Display name is required', field: 'displayName' });
		}

		const requestedRole: Role = requestedRoleInput === 'AUTHOR' ? 'AUTHOR' : 'READER';
		let uploadedImage: { path: string; url: string } | null = null;

		try {
			if (profileImageFile) {
				uploadedImage = await uploadManagedImage(profileImageFile, 'avatar', (extension) =>
					buildAvatarImagePath(userId!, extension)
				);
			}

			const nextProfileImage = uploadedImage
				? uploadedImage.url
				: clearProfileImage
					? null
					: (existingProfile?.profileImage ?? null);
			const nextProfileImagePath = uploadedImage
				? uploadedImage.path
				: clearProfileImage
					? null
					: (existingProfile?.profileImagePath ?? null);

			const profile = await prisma.profile.upsert({
				where: { userId: userId! },
				update: {
					displayName,
					bio: bio || null,
					profileImage: nextProfileImage,
					profileImagePath: nextProfileImagePath,
					role: requestedRole
				},
				create: {
					userId: userId!,
					displayName,
					bio: bio || null,
					profileImage: nextProfileImage,
					profileImagePath: nextProfileImagePath,
					role: requestedRole
				}
			});

			if ((uploadedImage || clearProfileImage) && existingProfile?.profileImagePath) {
				await removeManagedImage(existingProfile.profileImagePath);
			}

			return {
				profile: {
					displayName: profile.displayName,
					bio: profile.bio,
					role: profile.role,
					profileImage: profile.profileImage
				}
			};
		} catch (err) {
			if (uploadedImage) {
				await removeManagedImage(uploadedImage.path);
			}

			return toFormFailure(err, 'Unable to save profile right now.');
		}
	}
};
