import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import prisma from '$lib/server/prisma';
import { ensureRole } from '$lib/utils/ensureRole';

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

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const userId = locals.user?.id ?? null;
		await ensureRole(userId, 'AUTHOR');

		const formData = await request.formData();
		const title = sanitizeText(formData.get('title') as string | null);
		const content = sanitizeText(formData.get('content') as string | null);
		const imageUrl = sanitizeText(formData.get('imageUrl') as string | null);
		const published = validateBoolean(formData.get('published') as string | null);

		const validationError = validateForm(title, content);
		if (validationError) {
			return fail(400, { formError: validationError.message, field: validationError.field });
		}

		const article = await prisma.article.create({
			data: {
				authorUserId: userId!,
				title,
				content,
				imageUrl: imageUrl || null,
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
	}
};
