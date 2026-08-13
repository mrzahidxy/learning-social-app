import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '$lib/server/supabaseAdmin';

const MANAGED_BUCKET = env.SUPABASE_STORAGE_BUCKET || 'uploads';
const IMAGE_RULES = {
	'image/jpeg': { extension: 'jpg' },
	'image/png': { extension: 'png' },
	'image/webp': { extension: 'webp' }
} as const;

const AVATAR_MAX_SIZE = 2 * 1024 * 1024;
const ARTICLE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

type ImageContext = 'avatar' | 'article';

export type UploadedManagedImage = {
	path: string;
	url: string;
	contentType: keyof typeof IMAGE_RULES;
	extension: string;
};

const getFileExtension = (fileName: string) => {
	const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
	return extension === 'jpeg' ? 'jpg' : extension;
};

const validateManagedImageFile = (file: File, context: ImageContext) => {
	const rule = IMAGE_RULES[file.type as keyof typeof IMAGE_RULES];
	const maxSize = context === 'avatar' ? AVATAR_MAX_SIZE : ARTICLE_IMAGE_MAX_SIZE;

	if (!rule) {
		throw error(400, 'Only JPEG, PNG, and WebP images are allowed');
	}

	if (file.size <= 0) {
		throw error(400, 'Image file is empty');
	}

	if (file.size > maxSize) {
		throw error(
			400,
			context === 'avatar'
				? 'Avatar image must be 2 MB or smaller'
				: 'Article image must be 5 MB or smaller'
		);
	}

	const extension = getFileExtension(file.name);
	if (extension !== rule.extension) {
		throw error(400, 'File extension does not match the uploaded image type');
	}

	return { extension, contentType: file.type as keyof typeof IMAGE_RULES };
};

export const buildAvatarImagePath = (userId: string, extension: string) =>
	`avatars/${userId}/${randomUUID()}.${extension}`;

export const buildArticleImagePath = (authorUserId: string, articleId: string, extension: string) =>
	`articles/${authorUserId}/${articleId}/${randomUUID()}.${extension}`;

const isTrustedManagedPath = (path: string | null | undefined) =>
	Boolean(
		path &&
			/^(avatars|articles)\/[0-9a-f-]+\/[0-9a-f-]+(?:\/[0-9a-f-]+)?\.(jpg|png|webp)$/i.test(path)
	);

const getManagedPublicUrl = (path: string) =>
	`${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MANAGED_BUCKET}/${path}`;

export const uploadManagedImage = async (
	file: File,
	context: ImageContext,
	buildPath: (extension: string) => string
) => {
	const { contentType, extension } = validateManagedImageFile(file, context);
	const path = buildPath(extension);
	const supabaseAdmin = getSupabaseAdmin();
	const buffer = Buffer.from(await file.arrayBuffer());
	const { error: uploadError } = await supabaseAdmin.storage
		.from(MANAGED_BUCKET)
		.upload(path, buffer, {
			contentType,
			upsert: false
		});

	if (uploadError) {
		throw error(500, `Failed to upload image: ${uploadError.message}`);
	}

	return {
		path,
		url: getManagedPublicUrl(path),
		contentType,
		extension
	} satisfies UploadedManagedImage;
};

export const removeManagedImage = async (path: string | null | undefined) => {
	if (!path || !isTrustedManagedPath(path)) {
		return false;
	}

	const supabaseAdmin = getSupabaseAdmin();
	const { error: removeError } = await supabaseAdmin.storage.from(MANAGED_BUCKET).remove([path]);

	if (removeError) {
		console.error('Failed to remove managed image', { path, removeError });
		return false;
	}

	return true;
};

