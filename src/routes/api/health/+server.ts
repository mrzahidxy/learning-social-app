
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import prisma from '$lib/server/prisma';

export const GET: RequestHandler = async () => {
	const started = Date.now();

	try {
		await prisma.$queryRaw`SELECT 1`;

		return json({
			status: 'ok',
			database: 'healthy',
			latencyMs: Date.now() - started
		});
	} catch (error) {
		console.error('Database health check failed', error);

		return json(
			{
				status: 'error',
				database: 'unreachable'
			},
			{ status: 503 }
		);
	}
};