import {
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead
} from '../api/notifications';
import type { NotificationsQuery, NotificationSummary } from '../types';
import { DEFAULT_NOTIFICATION_LIMIT, sortNotificationsNewestFirst } from '../utils';

type ReadSnapshot = {
	notifications: NotificationSummary[];
	unreadCount: number;
};

export class NotificationStore {
	notifications = $state<NotificationSummary[]>([]);
	unreadCount = $state(0);
	initialLoading = $state(false);
	paginationLoading = $state(false);
	error = $state<string | null>(null);
	hasLoaded = $state(false);
	nextCursor = $state<string | null>(null);
	currentUnreadOnly = $state(false);

	private seenIds = new Set<string>();
	private currentLimit = DEFAULT_NOTIFICATION_LIMIT;

	get hasMore() {
		return this.nextCursor !== null;
	}

	reset() {
		this.resetState();
	}

	private resetState() {
		this.notifications = [];
		this.unreadCount = 0;
		this.initialLoading = false;
		this.paginationLoading = false;
		this.error = null;
		this.hasLoaded = false;
		this.nextCursor = null;
		this.currentUnreadOnly = false;
		this.currentLimit = DEFAULT_NOTIFICATION_LIMIT;
		this.seenIds = new Set<string>();
	}

	async loadInitial(query: NotificationsQuery = {}, force = false) {
		if (this.initialLoading) return;

		const limit = query.limit ?? this.currentLimit;
		const unreadOnly = query.unreadOnly ?? false;

		if (
			!force &&
			this.hasLoaded &&
			this.currentLimit === limit &&
			this.currentUnreadOnly === unreadOnly
		) {
			return;
		}

		this.initialLoading = true;
		this.error = null;
		this.currentLimit = limit;
		this.currentUnreadOnly = unreadOnly;

		try {
			const response = await listNotifications({
				limit,
				unreadOnly
			});

			this.notifications = sortNotificationsNewestFirst([...response.data.notifications]);
			this.unreadCount = response.data.unreadCount;
			this.nextCursor = response.data.nextCursor;
			this.hasLoaded = true;
			this.seenIds = new Set(this.notifications.map((notification) => notification.id));
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to load notifications.';
		} finally {
			this.initialLoading = false;
		}
	}

	async loadMore() {
		if (!this.nextCursor || this.paginationLoading) return;

		this.paginationLoading = true;
		this.error = null;

		try {
			const response = await listNotifications({
				limit: this.currentLimit,
				cursor: this.nextCursor,
				unreadOnly: this.currentUnreadOnly
			});

			const merged = [...this.notifications];

			for (const notification of response.data.notifications) {
				if (this.seenIds.has(notification.id)) continue;
				this.seenIds.add(notification.id);
				merged.push(notification);
			}

			this.notifications = sortNotificationsNewestFirst(merged);
			this.unreadCount = response.data.unreadCount;
			this.nextCursor = response.data.nextCursor;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to load more notifications.';
		} finally {
			this.paginationLoading = false;
		}
	}

	private captureSnapshot(): ReadSnapshot {
		return {
			notifications: this.notifications.map((notification) => ({ ...notification })),
			unreadCount: this.unreadCount
		};
	}

	private restoreSnapshot(snapshot: ReadSnapshot) {
		this.notifications = snapshot.notifications;
		this.unreadCount = snapshot.unreadCount;
		this.seenIds = new Set(this.notifications.map((notification) => notification.id));
	}

	async markOneAsRead(notificationId: string) {
		const notification = this.notifications.find((item) => item.id === notificationId);
		if (!notification) return false;

		const snapshot = this.captureSnapshot();

		if (!notification.read) {
			this.unreadCount = Math.max(0, this.unreadCount - 1);
			this.notifications = this.currentUnreadOnly
				? this.notifications.filter((item) => item.id !== notificationId)
				: this.notifications.map((item) =>
						item.id === notificationId ? { ...item, read: true } : item
					);
		}

		try {
			const response = await markNotificationRead(notificationId);
			if (!this.currentUnreadOnly) {
				this.notifications = this.notifications.map((item) =>
					item.id === notificationId ? response.data.notification : item
				);
			}
			return true;
		} catch (err) {
			this.restoreSnapshot(snapshot);
			this.error = err instanceof Error ? err.message : 'Unable to update notification.';
			return false;
		}
	}

	async markAllAsRead() {
		const unreadNotifications = this.notifications.filter((notification) => !notification.read);
		if (unreadNotifications.length === 0) return true;

		const snapshot = this.captureSnapshot();
		this.unreadCount = 0;
		this.notifications = this.currentUnreadOnly
			? []
			: this.notifications.map((notification) => ({ ...notification, read: true }));

		try {
			await markAllNotificationsRead();
			return true;
		} catch (err) {
			this.restoreSnapshot(snapshot);
			this.error = err instanceof Error ? err.message : 'Unable to update notifications.';
			return false;
		}
	}
}

export const notificationStore = new NotificationStore();
