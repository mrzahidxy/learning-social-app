import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import {
	notificationsError,
	notificationsOk,
	requireNotificationUser,
	toNotificationSummary
} from '$lib/features/notifications/server';
import { isHttpError } from '@sveltejs/kit';

export const PATCH: RequestHandler = async ({ locals, params }) => {
	try {
		const userId = requireNotificationUser(locals);

		const notification = await prisma.notification.findFirst({
			where: {
				id: params.id,
				userId
			},
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
		});

		if (!notification) {
			return notificationsError(404, 'Notification not found');
		}

		if (!notification.read) {
			await prisma.notification.update({
				where: { id: notification.id },
				data: { read: true }
			});
		}

		return notificationsOk({
			notification: {
				...toNotificationSummary(notification),
				read: true
			}
		});
	} catch (err) {
		if (isHttpError(err)) {
			return notificationsError(err.status, err.body.message);
		}

		console.error('Failed to mark notification as read', err);
		return notificationsError(500, 'Unable to update notification');
	}
};
