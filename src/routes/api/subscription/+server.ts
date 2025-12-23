// src/routes/api/subscription/+server.ts
import prisma from '$lib/server/prisma';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type AuthenticatedUser = NonNullable<App.Locals['user']>;
const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ok = <T>(data: T, status = 200) => json({ status: 'ok', data }, { status });

const requireUser = (locals: App.Locals): AuthenticatedUser => {
	const user = locals.user;
	if (!user?.id) throw error(401, 'Unauthorized');
	return user;
};

const parseAuthorUserId = (value: unknown) => {
	if (!value || typeof value !== 'string') throw error(400, 'authorUserId is required');
	const trimmed = value.trim();
	if (!UUID_PATTERN.test(trimmed)) throw error(400, 'authorUserId must be a valid UUID');
	return trimmed;
};

const readAuthorFromBody = async (request: Request) => {
	try {
		const payload = (await request.json()) as Record<string, unknown>;
		return parseAuthorUserId(payload?.authorUserId);
	} catch {
		throw error(400, 'Request body must be valid JSON');
	}
};

/**
 * POST /api/subscription
 * Body: { "authorUserId": "uuid-of-author" }
 *
 * Creates a subscription. Duplicate calls are treated as success (idempotent).
 */
export const POST: RequestHandler = async (event) => {
	const user = requireUser(event.locals);
	const authorUserId = await readAuthorFromBody(event.request);

	if (authorUserId === user.id) {
		throw error(400, 'You cannot subscribe to yourself');
	}

	try {
		const subscription = await prisma.subscription.upsert({
			where: { userId_authorUserId: { userId: user.id, authorUserId } },
			create: { userId: user.id, authorUserId },
			update: {}
		});

		return ok({
			id: subscription.id,
			userId: subscription.userId,
			authorUserId: subscription.authorUserId
		});
	} catch (err) {
		console.error('Failed to create subscription', { userId: user.id, authorUserId, err });
		throw error(500, 'Unable to create subscription');
	}
};

/**
 * DELETE /api/subscription
 * Body: { "authorUserId": "uuid-of-author" }
 *
 * Removes the subscription if it exists.
 * If it doesn't exist, still returns 204 (idempotent).
 */
export const DELETE: RequestHandler = async (event) => {
	const user = requireUser(event.locals);
	const authorUserId = await readAuthorFromBody(event.request);

	try {
		await prisma.subscription.deleteMany({
			where: { userId: user.id, authorUserId }
		});
		return new Response(null, { status: 204 });
	} catch (err) {
		console.error('Failed to remove subscription', { userId: user.id, authorUserId, err });
		throw error(500, 'Unable to remove subscription');
	}
};

/**
 * GET /api/subscription?authorUserId=...
 *
 * Returns whether the current user is subscribed to the given author.
 */
export const GET: RequestHandler = async (event) => {
	const user = requireUser(event.locals);
	const url = new URL(event.request.url);
	const authorUserId = parseAuthorUserId(url.searchParams.get('authorUserId'));

	try {
		const subscription = await prisma.subscription.findUnique({
			where: { userId_authorUserId: { userId: user.id, authorUserId } },
			select: { id: true }
		});

		return ok({ isSubscribed: Boolean(subscription) });
	} catch (err) {
		console.error('Failed to load subscription status', { userId: user.id, authorUserId, err });
		throw error(500, 'Unable to fetch subscription status');
	}
};
