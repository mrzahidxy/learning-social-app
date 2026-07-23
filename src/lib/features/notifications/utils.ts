import type { NotificationSummary } from './types';

export const DEFAULT_NOTIFICATION_LIMIT = 10;
export const PAGE_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 50;

export const buildNotificationBadgeLabel = (count: number) => {
	if (count <= 0) return '0';
	if (count > 99) return '99+';
	return String(count);
};

export const sortNotificationsNewestFirst = (notifications: NotificationSummary[]) =>
	notifications.sort((left, right) => {
		const createdAtOrder =
			new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
		return createdAtOrder !== 0 ? createdAtOrder : right.id.localeCompare(left.id);
	});

export const getNotificationArticleHref = (articleId: string) => `/articles/${articleId}`;
