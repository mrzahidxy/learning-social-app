<script lang="ts">
	import { goto } from '$app/navigation';
	import NotificationItem from '$lib/features/notifications/components/NotificationItem.svelte';
	import { notificationStore } from '$lib/features/notifications/stores/notificationStore.svelte';
	import type { NotificationSummary } from '$lib/features/notifications/types';
	import {
		getNotificationArticleHref,
		PAGE_NOTIFICATION_LIMIT
	} from '$lib/features/notifications/utils';

	let unreadOnly = $state(false);
	let pendingIds = $state(new Set<string>());

	$effect(() => {
		void notificationStore.loadInitial({ limit: PAGE_NOTIFICATION_LIMIT, unreadOnly }, true);
	});

	async function openNotification(notification: NotificationSummary) {
		pendingIds.add(notification.id);
		const success = await notificationStore.markOneAsRead(notification.id);
		pendingIds.delete(notification.id);

		if (success) {
			await goto(getNotificationArticleHref(notification.articleId));
		}
	}

	async function markRead(notification: NotificationSummary) {
		pendingIds.add(notification.id);
		await notificationStore.markOneAsRead(notification.id);
		pendingIds.delete(notification.id);
	}

	async function markAllRead() {
		await notificationStore.markAllAsRead();
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
				disabled={notificationStore.unreadCount === 0}
			>
				Mark all as read
			</button>
		</div>
	</header>

	{#if notificationStore.error && !notificationStore.initialLoading}
		<div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<p>{notificationStore.error}</p>
			<button
				type="button"
				class="mt-2 font-medium text-red-800 underline"
				onclick={() =>
					notificationStore.loadInitial({ limit: PAGE_NOTIFICATION_LIMIT, unreadOnly }, true)}
			>
				Try again
			</button>
		</div>
	{/if}

	<div class="flex items-center justify-between text-sm text-gray-500">
		<p>Latest notifications</p>
		<p>{notificationStore.unreadCount} unread total</p>
	</div>

	{#if notificationStore.initialLoading}
		<div class="space-y-3">
			{#each Array.from({ length: 4 }) as _, index (index)}
				<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
					<div class="h-4 w-4/5 rounded bg-gray-200"></div>
					<div class="mt-3 h-3 w-1/3 rounded bg-gray-100"></div>
				</div>
			{/each}
		</div>
	{:else if notificationStore.notifications.length === 0}
		<div class="rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-10 text-center">
			<h2 class="text-lg font-semibold text-gray-900">No notifications to show</h2>
			<p class="mt-2 text-sm text-gray-500">
				Published articles from authors you follow will appear here.
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each notificationStore.notifications as notification (notification.id)}
				<NotificationItem
					{notification}
					pending={pendingIds.has(notification.id)}
					onOpen={openNotification}
					onMarkRead={markRead}
				/>
			{/each}
		</div>
	{/if}

	{#if notificationStore.hasMore}
		<div class="flex justify-center">
			<button
				type="button"
				class="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				onclick={() => notificationStore.loadMore()}
				disabled={notificationStore.paginationLoading}
			>
				{notificationStore.paginationLoading ? 'Loading...' : 'Load more'}
			</button>
		</div>
	{/if}
</section>
