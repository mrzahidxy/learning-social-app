import { requireAdmin } from '$lib/server/auth/authorization';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	await requireAdmin(locals.user?.id ?? null);

	return {};
};
