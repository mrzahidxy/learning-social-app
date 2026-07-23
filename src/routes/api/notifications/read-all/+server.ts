import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import {
	notificationsError,
	notificationsOk,
	requireNotificationUser
} from '$lib/features/notifications/server';
import { isHttpError } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({ locals }) => {
	try {
		const userId = requireNotificationUser(locals);
		const result = await prisma.notification.updateMany({
			where: {
				userId,
				read: false
			},
			data: {
				read: true
			}
		});

		return notificationsOk({
			updatedCount: result.count
		});
	} catch (err) {
		if (isHttpError(err)) {
			return notificationsError(err.status, err.body.message);
		}

		console.error('Failed to mark all notifications as read', err);
		return notificationsError(500, 'Unable to update notifications');
	}
};
