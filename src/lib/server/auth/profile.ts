import type { Profile, Role } from '@prisma/client';
import prisma from '$lib/server/prisma';

export const PROFILE_SETUP_PATH = '/user/profile/setup';

export const isProfileComplete = (profile: Pick<Profile, 'displayName'> | null | undefined) =>
	Boolean(profile?.displayName?.trim());

const shouldBypassProfileSetupRedirect = (pathname: string) =>
	[
		PROFILE_SETUP_PATH,
		'/confirm',
		'/signout',
		'/_app',
		'/images',
		'/api/supabase/storage'
	].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export const provisionProfile = async (userId: string) =>
	prisma.profile.upsert({
		where: { userId },
		create: {
			userId,
			role: 'READER'
		},
		update: {},
		select: {
			userId: true,
			role: true,
			displayName: true,
			bio: true,
			profileImage: true,
			createdAt: true,
			updatedAt: true
		}
	});

export const isValidRole = (value: unknown): value is Role =>
	value === 'READER' || value === 'AUTHOR' || value === 'ADMIN';

const MAX_DISPLAY_NAME_LENGTH = 80;
const MAX_BIO_LENGTH = 500;
const MAX_PROFILE_IMAGE_LENGTH = 2048;

const sanitize = (value: FormDataEntryValue | null) =>
	typeof value === 'string' ? value.trim() : '';

export type ProfileFormState = {
	formError?: string;
	field?: 'displayName' | 'bio' | 'profileImageUrl';
	values?: {
		displayName: string;
		bio: string;
		profileImageUrl: string;
	};
};

export const parseProfileForm = (formData: FormData): ProfileFormState & {
	data?: {
		displayName: string;
		bio: string | null;
		profileImage: string | null;
	};
} => {
	const displayName = sanitize(formData.get('displayName'));
	const bio = sanitize(formData.get('bio'));
	const profileImageUrl = sanitize(formData.get('profileImageUrl'));

	if (!displayName) {
		return {
			formError: 'Display name is required',
			field: 'displayName',
			values: { displayName, bio, profileImageUrl }
		};
	}

	if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
		return {
			formError: `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer`,
			field: 'displayName',
			values: { displayName, bio, profileImageUrl }
		};
	}

	if (bio.length > MAX_BIO_LENGTH) {
		return {
			formError: `Bio must be ${MAX_BIO_LENGTH} characters or fewer`,
			field: 'bio',
			values: { displayName, bio, profileImageUrl }
		};
	}

	if (profileImageUrl.length > MAX_PROFILE_IMAGE_LENGTH) {
		return {
			formError: 'Profile image URL is too long',
			field: 'profileImageUrl',
			values: { displayName, bio, profileImageUrl }
		};
	}

	return {
		data: {
			displayName,
			bio: bio || null,
			profileImage: profileImageUrl || null
		},
		values: { displayName, bio, profileImageUrl }
	};
};

export const updateOwnProfile = async (
	userId: string,
	data: {
		displayName: string;
		bio: string | null;
		profileImage: string | null;
	}
) =>
	prisma.profile.update({
		where: { userId },
		data: {
			displayName: data.displayName,
			bio: data.bio,
			profileImage: data.profileImage
		},
		select: {
			displayName: true,
			bio: true,
			role: true,
			profileImage: true
		}
	});

export { shouldBypassProfileSetupRedirect };
