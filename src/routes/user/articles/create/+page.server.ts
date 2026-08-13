import { fail, isHttpError } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { ensureRole } from '$lib/features/user/utils/ensureRole';
import { buildArticleImagePath, removeManagedImage, uploadManagedImage } from '$lib/server/storage';

const sanitizeText = (value: string | null) => value?.trim() ?? '';
const validateBoolean = (value: string | null) =>
	value === 'true' || value === 'on' || value === '1';

const validateForm = (title: string, content: string) => {
	if (!title) {
		return { message: 'Title is required', field: 'title' };
	}

	if (title.length > 100) {
		return { message: 'Title must be less than 100 characters', field: 'title' };
	}

	if (!content) {
		return { message: 'Content is required', field: 'content' };
	}

	if (content.length < 20) {
		return { message: 'Content must be at least 20 characters', field: 'content' };
	}

	return null;
};

const toFile = (value: FormDataEntryValue | null) =>
	value instanceof File && value.size > 0 ? value : null;

const toFormFailure = (err: unknown, fallbackMessage: string) => {
	if (isHttpError(err)) {
		return fail(err.status, { formError: err.body.message });
	}

	return fail(500, {
		formError: err instanceof Error ? err.message : fallbackMessage
	});
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id ?? null;
		await ensureRole(userId, 'AUTHOR');

		const formData = await request.formData();
		const title = sanitizeText(formData.get('title') as string | null);
		const content = sanitizeText(formData.get('content') as string | null);
		const published = validateBoolean(formData.get('published') as string | null);
		const imageFile = toFile(formData.get('articleImage'));

		const validationError = validateForm(title, content);
		if (validationError) {
			return fail(400, { formError: validationError.message, field: validationError.field });
		}

		const articleId = randomUUID();
		let uploadedImage: { path: string; url: string } | null = null;

		try {
			if (imageFile) {
				uploadedImage = await uploadManagedImage(imageFile, 'article', (extension) =>
					buildArticleImagePath(userId!, articleId, extension)
				);
			}

			const article = await prisma.article.create({
				data: {
					id: articleId,
					authorUserId: userId!,
					title,
					content,
					imageUrl: uploadedImage?.url ?? null,
					imagePath: uploadedImage?.path ?? null,
					published
				},
				select: {
					id: true,
					title: true,
					published: true,
					imageUrl: true,
					authorUserId: true,
					createdAt: true,
					updatedAt: true
				}
			});

			return { article };
		} catch (err) {
			if (uploadedImage) {
				await removeManagedImage(uploadedImage.path);
			}

			return toFormFailure(err, 'Unable to save the article right now.');
		}
	}
};
