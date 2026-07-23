<script lang="ts">
	import type { NotificationSummary } from '../types';
	import NotificationItem from './NotificationItem.svelte';

	type NotificationDropdownProps = {
		isLoading: boolean;
		error: string | null;
		notifications: NotificationSummary[];
		unreadCount: number;
		onRetry: () => void | Promise<void>;
		onMarkAllRead: () => void | Promise<void>;
		onOpenNotification: (notification: NotificationSummary) => void | Promise<void>;
		onMarkRead: (notification: NotificationSummary) => void | Promise<void>;
		onViewAll: () => void | Promise<void>;
	};

	const {
		isLoading,
		error,
		notifications,
		unreadCount,
		onRetry,
		onMarkAllRead,
		onOpenNotification,
		onMarkRead,
		onViewAll
	}: NotificationDropdownProps = $props();
</script>

<div
	class="ring-opacity-5 absolute top-12 right-0 z-20 w-[22rem] rounded-2xl border border-gray-200 bg-white p-3 shadow-xl ring-1 ring-black/5"
	role="dialog"
	aria-label="Notifications"
>
	<div class="mb-3 flex items-center justify-between gap-3">
		<div>
			<h2 class="text-sm font-semibold text-gray-900">Notifications</h2>
			<p class="text-xs text-gray-500">
				{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
			</p>
		</div>
		<button
			type="button"
			class="text-xs font-medium text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
			onclick={onMarkAllRead}
			disabled={unreadCount === 0 || isLoading}
		>
			Mark all as read
		</button>
	</div>

	{#if isLoading}
		<div class="space-y-2">
			{#each Array.from({ length: 3 }) as _, index (index)}
				<div class="rounded-xl border border-gray-200 p-3">
					<div class="h-3 w-4/5 rounded bg-gray-200"></div>
					<div class="mt-2 h-3 w-2/5 rounded bg-gray-100"></div>
				</div>
			{/each}
		</div>
	{:else if error}
		<div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
			<p>{error}</p>
			<button type="button" class="mt-2 font-medium text-red-800 underline" onclick={onRetry}>
				Try again
			</button>
		</div>
	{:else if notifications.length === 0}
		<div class="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
			<p class="text-sm font-medium text-gray-700">No notifications yet.</p>
			<p class="mt-1 text-xs text-gray-500">You will see new article publication updates here.</p>
		</div>
	{:else}
		<div class="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
			{#each notifications as notification (notification.id)}
				<NotificationItem compact {notification} onOpen={onOpenNotification} {onMarkRead} />
			{/each}
		</div>
	{/if}

	<div class="mt-3 border-t border-gray-100 pt-3">
		<button
			type="button"
			class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
			onclick={onViewAll}
		>
			View all notifications
		</button>
	</div>
</div>
