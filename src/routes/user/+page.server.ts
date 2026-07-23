import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.profile?.role === 'AUTHOR' || locals.profile?.role === 'ADMIN') {
		throw redirect(302, '/user/articles');
	}

	throw redirect(302, '/user/profile');
};
