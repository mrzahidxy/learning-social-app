import { error } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { PageServerLoad } from './$types';

const PAGE_SIZE = 10;

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = locals;
	if (!user) throw error(401, 'Unauthorized');

	const current = await prisma.profile.findUnique({
		where: { userId: user.id },
		select: { role: true }
	});
	if (current?.role !== 'ADMIN') throw error(403, 'Forbidden');

	const page = Math.max(Number(url.searchParams.get('page') ?? 1), 1);
	const search = url.searchParams.get('q')?.trim() ?? '';

	const where = search
		? {
				OR: [
					{ displayName: { contains: search, mode: 'insensitive' as const } },
					{ userId: { contains: search, mode: 'insensitive' as const } }
				]
			}
		: {};

	const [users, total] = await Promise.all([
		prisma.profile.findMany({
			where,
			orderBy: { updatedAt: 'desc' },
			skip: (page - 1) * PAGE_SIZE,
			take: PAGE_SIZE,
			select: {
				userId: true,
				displayName: true,
				role: true,
				updatedAt: true
			}
		}),
		prisma.profile.count({ where })
	]);

	return {
		users,
		pagination: { page, pageSize: PAGE_SIZE, total },
		search
	};
};
