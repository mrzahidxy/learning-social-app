import { error, json } from '@sveltejs/kit';
import type { NotificationSummary, NotificationTypeValue } from './types';

type NotificationWithArticleTitle = {
	id: string;
	type: NotificationTypeValue;
	message: string;
	read: boolean;
	articleId: string;
	createdAt: Date;
	article: { title: string } | null;
};

export const notificationsOk = <T>(data: T, status = 200) =>
	json({ status: 'ok', data }, { status });

export const notificationsError = (status: number, message: string) =>
	json({ status: 'error', error: { message } }, { status });

export const requireNotificationUser = (locals: App.Locals) => {
	const userId = locals.user?.id;
	if (!userId) {
		throw error(401, 'Unauthorized');
	}
	return userId;
};

export const toNotificationSummary = (
	notification: NotificationWithArticleTitle
): NotificationSummary => ({
	id: notification.id,
	type: notification.type,
	message: notification.message,
	read: notification.read,
	articleId: notification.articleId,
	articleTitle: notification.article?.title ?? null,
	createdAt: notification.createdAt.toISOString()
});
