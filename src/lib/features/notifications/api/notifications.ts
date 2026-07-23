import type {
	MarkAllNotificationsReadResponse,
	MarkNotificationReadResponse,
	NotificationsListResponse,
	NotificationsQuery
} from '../types';

const buildNotificationsUrl = (query: NotificationsQuery = {}) => {
	const params = new URLSearchParams();

	if (query.limit) params.set('limit', String(query.limit));
	if (query.cursor) params.set('cursor', query.cursor);
	if (query.unreadOnly) params.set('unreadOnly', 'true');

	return `/api/notifications${params.size ? `?${params.toString()}` : ''}`;
};

const readErrorMessage = async (response: Response) => {
	try {
		const payload = (await response.json()) as { error?: { message?: string } };
		return payload?.error?.message || `Request failed with status ${response.status}`;
	} catch {
		return `Request failed with status ${response.status}`;
	}
};

export const listNotifications = async (query: NotificationsQuery = {}) => {
	const response = await fetch(buildNotificationsUrl(query), {
		method: 'GET',
		headers: { accept: 'application/json' }
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response));
	}

	return (await response.json()) as NotificationsListResponse;
};

export const markNotificationRead = async (notificationId: string) => {
	const response = await fetch(`/api/notifications/${notificationId}/read`, {
		method: 'PATCH',
		headers: { accept: 'application/json' }
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response));
	}

	return (await response.json()) as MarkNotificationReadResponse;
};

export const markAllNotificationsRead = async () => {
	const response = await fetch('/api/notifications/read-all', {
		method: 'PATCH',
		headers: { accept: 'application/json' }
	});

	if (!response.ok) {
		throw new Error(await readErrorMessage(response));
	}

	return (await response.json()) as MarkAllNotificationsReadResponse;
};
