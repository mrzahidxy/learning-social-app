<script lang="ts">
	import { buildNotificationBadgeLabel } from '../utils';

	type NotificationBellProps = {
		isOpen: boolean;
		isLoading: boolean;
		unreadCount: number;
		onToggle: () => void;
	};

	const { isOpen, isLoading, unreadCount, onToggle }: NotificationBellProps = $props();
</script>

<button
	type="button"
	class="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:border-blue-200 hover:text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
	aria-expanded={isOpen}
	aria-haspopup="dialog"
	aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
	onclick={onToggle}
>
	<svg
		aria-hidden="true"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		class="h-5 w-5"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5m6 0a3 3 0 1 1-6 0m6 0H9"
		/>
	</svg>

	<div
		class="absolute top-0 right-0 flex h-5 min-w-5 translate-x-1/4 -translate-y-1/4 items-center justify-center"
	>
		{#if isLoading}
			<span class="block h-4 w-4 rounded-full bg-gray-200"></span>
		{:else if unreadCount > 0}
			<span
				class="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white"
			>
				{buildNotificationBadgeLabel(unreadCount)}
			</span>
		{/if}
	</div>
</button>
