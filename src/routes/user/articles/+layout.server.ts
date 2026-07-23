import { requireAuthor } from '$lib/server/auth/authorization';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	await requireAuthor(locals.user?.id ?? null);

	return {};
};
