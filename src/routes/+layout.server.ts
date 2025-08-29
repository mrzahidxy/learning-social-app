import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies, url }) => {
	const PUBLIC = [/^\/$/, /^\/login$/, /^\/confirm(?:\/|$)/, /^\/assets\/|^\/favicon/];
	const isPublic = PUBLIC.some((rx) => rx.test(url.pathname));
	const { session, user } = await locals.safeGetSession();

	if (!session && !isPublic) {
		throw redirect(303, `/login`);
	}
	return { session, user, cookies: cookies.getAll() };
};
