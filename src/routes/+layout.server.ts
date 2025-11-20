import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { PUBLIC_ROUTES } from '$lib/constants/auth';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	const isPublic = PUBLIC_ROUTES.some((rx) => rx.test(url.pathname));
	const { session, user } = await locals.safeGetSession();

	if (!session && !isPublic) {
		throw redirect(303, `/login`);
	}
	return { session, user, cookies: cookies.getAll() };
};
