import {
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead
} from '../api/notifications';
import type { NotificationSummary } from '../types';
import { DEFAULT_NOTIFICATION_LIMIT } from '../utils';

export class NotificationStore {
	notifications = $state<NotificationSummary[]>([]);
	unreadCount = $state(0);
	initialLoading = $state(false);
	error = $state<string | null>(null);
	hasLoaded = $state(false);

	reset() {
		this.notifications = [];
		this.unreadCount = 0;
		this.initialLoading = false;
		this.error = null;
		this.hasLoaded = false;
	}

	async loadInitial(limit = DEFAULT_NOTIFICATION_LIMIT, force = false) {
		if (this.initialLoading || (this.hasLoaded && !force)) return;

		this.initialLoading = true;
		this.error = null;

		try {
			const response = await listNotifications({ limit });
			this.notifications = response.data.notifications;
			this.unreadCount = response.data.unreadCount;
			this.hasLoaded = true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to load notifications.';
		} finally {
			this.initialLoading = false;
		}
	}

	async refreshCount() {
		try {
			const response = await listNotifications({ limit: 1 });
			this.unreadCount = response.data.unreadCount;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to refresh notifications.';
		}
	}

	async markOneAsRead(notificationId: string) {
		const notification = this.notifications.find((item) => item.id === notificationId);
		if (!notification) return false;

		try {
			const response = await markNotificationRead(notificationId);
			this.notifications = this.notifications.map((item) =>
				item.id === notificationId ? response.data.notification : item
			);

			if (!notification.read) {
				this.unreadCount = Math.max(0, this.unreadCount - 1);
			}

			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to update notification.';
			return false;
		}
	}

	async markAllAsRead() {
		if (this.unreadCount === 0) return true;

		try {
			await markAllNotificationsRead();
			this.unreadCount = 0;
			this.notifications = this.notifications.map((notification) => ({ ...notification, read: true }));
			return true;
		} catch (err) {
			this.error = err instanceof Error ? err.message : 'Unable to update notifications.';
			return false;
		}
	}
}

export const notificationStore = new NotificationStore();
