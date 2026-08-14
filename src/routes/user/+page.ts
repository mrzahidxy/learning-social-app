import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { role } = await parent();

	if (role === 'ADMIN') {
		throw redirect(302, '/admin/articles');
	}

	throw redirect(302, role === 'AUTHOR' ? '/user/articles' : '/user/notifications');
};
