import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import {
	notificationsError,
	notificationsOk,
	requireNotificationUser,
	toNotificationSummary
} from '$lib/features/notifications/server';
import { MAX_NOTIFICATION_LIMIT } from '$lib/features/notifications/utils';
import { isHttpError } from '@sveltejs/kit';

const DEFAULT_LIMIT = 10;

const parseLimit = (value: string | null) => {
	if (!value) return DEFAULT_LIMIT;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_LIMIT;
	return Math.min(parsed, MAX_NOTIFICATION_LIMIT);
};

const parseUnreadOnly = (value: string | null) => value === 'true';

const decodeCursor = (cursor: string | null) => {
	if (!cursor) return null;

	try {
		const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as {
			id?: string;
			createdAt?: string;
		};

		if (!parsed.id || !parsed.createdAt) return null;

		const createdAt = new Date(parsed.createdAt);
		if (Number.isNaN(createdAt.getTime())) return null;

		return { id: parsed.id, createdAt };
	} catch {
		return null;
	}
};

const encodeCursor = (id: string, createdAt: Date) =>
	Buffer.from(JSON.stringify({ id, createdAt: createdAt.toISOString() }), 'utf8').toString(
		'base64url'
	);

export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		const userId = requireNotificationUser(locals);
		const limit = parseLimit(url.searchParams.get('limit'));
		const unreadOnly = parseUnreadOnly(url.searchParams.get('unreadOnly'));
		const cursor = decodeCursor(url.searchParams.get('cursor'));

		if (url.searchParams.get('cursor') && !cursor) {
			return notificationsError(400, 'Invalid cursor');
		}

		const baseWhere = {
			userId,
			...(unreadOnly ? { read: false } : {})
		};

		const [notifications, unreadCount] = await Promise.all([
			prisma.notification.findMany({
				where: {
					...baseWhere,
					...(cursor
						? {
								OR: [
									{ createdAt: { lt: cursor.createdAt } },
									{
										createdAt: cursor.createdAt,
										id: { lt: cursor.id }
									}
								]
							}
						: {})
				},
				orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
				take: limit + 1,
				select: {
					id: true,
					type: true,
					message: true,
					read: true,
					articleId: true,
					createdAt: true,
					article: {
						select: {
							title: true
						}
					}
				}
			}),
			prisma.notification.count({
				where: {
					userId,
					read: false
				}
			})
		]);

		const hasMore = notifications.length > limit;
		const items = hasMore ? notifications.slice(0, limit) : notifications;
		const lastItem = items.at(-1);

		return notificationsOk({
			notifications: items.map(toNotificationSummary),
			unreadCount,
			nextCursor: hasMore && lastItem ? encodeCursor(lastItem.id, lastItem.createdAt) : null
		});
	} catch (err) {
		if (isHttpError(err)) {
			return notificationsError(err.status, err.body.message);
		}

		console.error('Failed to list notifications', err);
		return notificationsError(500, 'Unable to load notifications');
	}
};
