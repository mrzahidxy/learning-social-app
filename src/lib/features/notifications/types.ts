export const NOTIFICATION_TYPES = ['ARTICLE_PUBLISHED'] as const;

export type NotificationTypeValue = (typeof NOTIFICATION_TYPES)[number];

export type NotificationSummary = {
	id: string;
	type: NotificationTypeValue;
	message: string;
	read: boolean;
	articleId: string;
	articleTitle: string | null;
	createdAt: string;
};

export type NotificationsListResponse = {
	status: 'ok';
	data: {
		notifications: NotificationSummary[];
		unreadCount: number;
		nextCursor: string | null;
	};
};

export type MarkNotificationReadResponse = {
	status: 'ok';
	data: {
		notification: NotificationSummary;
	};
};

export type MarkAllNotificationsReadResponse = {
	status: 'ok';
	data: {
		updatedCount: number;
	};
};

export type NotificationsQuery = {
	limit?: number;
	cursor?: string | null;
	unreadOnly?: boolean;
};
