export const DEFAULT_NOTIFICATION_LIMIT = 10;
export const PAGE_NOTIFICATION_LIMIT = 20;
export const MAX_NOTIFICATION_LIMIT = 50;

export const buildNotificationBadgeLabel = (count: number) => {
	if (count <= 0) return '0';
	if (count > 99) return '99+';
	return String(count);
};

export const getNotificationArticleHref = (articleId: string) => `/articles/${articleId}`;
