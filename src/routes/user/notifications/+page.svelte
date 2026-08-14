<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		listNotifications,
		markAllNotificationsRead,
		markNotificationRead
	} from '$lib/features/notifications/api/notifications';
	import NotificationItem from '$lib/features/notifications/components/NotificationItem.svelte';
	import { notificationStore } from '$lib/features/notifications/stores/notificationStore.svelte';
	import type { NotificationSummary } from '$lib/features/notifications/types';
	import {
		getNotificationArticleHref,
		PAGE_NOTIFICATION_LIMIT
	} from '$lib/features/notifications/utils';

	let unreadOnly = $state(false);
	let notifications = $state<NotificationSummary[]>([]);
	let unreadCount = $state(0);
	let nextCursor = $state<string | null>(null);
	let initialLoading = $state(false);
	let paginationLoading = $state(false);
	let error = $state<string | null>(null);
	let pendingIds = $state(new Set<string>());

	const hasMore = $derived(nextCursor !== null);

	$effect(() => {
		void loadInitial();
	});

	function setPending(id: string, pending: boolean) {
		const next = new Set(pendingIds);
		if (pending) {
			next.add(id);
		} else {
			next.delete(id);
		}
		pendingIds = next;
	}

	async function loadInitial() {
		initialLoading = true;
		error = null;

		try {
			const response = await listNotifications({ limit: PAGE_NOTIFICATION_LIMIT, unreadOnly });
			notifications = response.data.notifications;
			unreadCount = response.data.unreadCount;
			nextCursor = response.data.nextCursor;
			notificationStore.unreadCount = response.data.unreadCount;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to load notifications.';
		} finally {
			initialLoading = false;
		}
	}

	async function loadMore() {
		if (!nextCursor || paginationLoading) return;

		paginationLoading = true;
		error = null;

		try {
			const response = await listNotifications({
				limit: PAGE_NOTIFICATION_LIMIT,
				cursor: nextCursor,
				unreadOnly
			});

			const seenIds = new Set(notifications.map((notification) => notification.id));
			notifications = [
				...notifications,
				...response.data.notifications.filter((notification) => !seenIds.has(notification.id))
			];
			unreadCount = response.data.unreadCount;
			nextCursor = response.data.nextCursor;
			notificationStore.unreadCount = response.data.unreadCount;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to load more notifications.';
		} finally {
			paginationLoading = false;
		}
	}

	async function openNotification(notification: NotificationSummary) {
		const success = await markRead(notification);

		if (success) {
			await goto(getNotificationArticleHref(notification.articleId));
		}
	}

	async function markReadOnly(notification: NotificationSummary) {
		await markRead(notification);
	}

	async function markRead(notification: NotificationSummary) {
		setPending(notification.id, true);

		try {
			const response = await markNotificationRead(notification.id);
			const updatedNotification = response.data.notification;
			notifications = unreadOnly
				? notifications.filter((item) => item.id !== notification.id)
				: notifications.map((item) => (item.id === notification.id ? updatedNotification : item));
			unreadCount = !notification.read ? Math.max(0, unreadCount - 1) : unreadCount;
			await notificationStore.refreshCount();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to update notification.';
			return false;
		} finally {
			setPending(notification.id, false);
		}
	}

	async function markAllRead() {
		if (unreadCount === 0) return;

		try {
			await markAllNotificationsRead();
			notifications = unreadOnly
				? []
				: notifications.map((notification) => ({ ...notification, read: true }));
			unreadCount = 0;
			await notificationStore.refreshCount();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unable to update notifications.';
		}
	}
</script>

<section class="mx-auto max-w-4xl space-y-6 px-4 py-8">
	<header
		class="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between"
	>
		<div>
			<h1 class="text-2xl font-semibold text-gray-900">Notifications</h1>
			<p class="mt-1 text-sm text-gray-600">Article publication notifications.</p>
		</div>
		<div class="flex flex-wrap items-center gap-3">
			<label
				class="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-700"
			>
				<input
					type="checkbox"
					bind:checked={unreadOnly}
					class="rounded border-gray-300 text-blue-600"
				/>
				Unread only
			</label>
			<button
				type="button"
				class="rounded-full border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
				onclick={markAllRead}
				disabled={unreadCount === 0}
			>
				Mark all as read
			</button>
		</div>
	</header>

	{#if error && !initialLoading}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<p>{error}</p>
			<button type="button" class="mt-2 font-medium text-red-800 underline" onclick={loadInitial}>
				Try again
			</button>
		</div>
	{/if}

	<div class="flex items-center justify-between text-sm text-gray-500">
		<p>Latest notifications</p>
		<p>{unreadCount} unread total</p>
	</div>

	{#if initialLoading}
		<div class="space-y-3">
			{#each Array.from({ length: 4 }) as _, index (index)}
				<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					<div class="h-4 w-4/5 rounded bg-gray-200"></div>
					<div class="mt-3 h-3 w-1/3 rounded bg-gray-100"></div>
				</div>
			{/each}
		</div>
	{:else if notifications.length === 0}
		<div class="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
			<h2 class="text-lg font-semibold text-gray-900">No notifications to show</h2>
			<p class="mt-2 text-sm text-gray-500">
				Published articles from authors you follow will appear here.
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each notifications as notification (notification.id)}
				<NotificationItem
					{notification}
					pending={pendingIds.has(notification.id)}
					onOpen={openNotification}
					onMarkRead={markReadOnly}
				/>
			{/each}
		</div>
	{/if}

	{#if hasMore}
		<div class="flex justify-center">
			<button
				type="button"
				class="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				onclick={loadMore}
				disabled={paginationLoading}
			>
				{paginationLoading ? 'Loading...' : 'Load more'}
			</button>
		</div>
	{/if}
</section>
