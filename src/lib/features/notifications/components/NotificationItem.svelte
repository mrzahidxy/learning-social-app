<script lang="ts">
	import { formatDateTime } from '$lib/shared/utils/date';
	import type { NotificationSummary } from '../types';

	type NotificationItemProps = {
		notification: NotificationSummary;
		compact?: boolean;
		pending?: boolean;
		onOpen: (notification: NotificationSummary) => void | Promise<void>;
		onMarkRead: (notification: NotificationSummary) => void | Promise<void>;
	};

	const {
		notification,
		compact = false,
		pending = false,
		onOpen,
		onMarkRead
	}: NotificationItemProps = $props();
</script>

<article
	class={`rounded-xl border p-3 transition ${
		notification.read
			? 'border-gray-200 bg-white'
			: 'border-blue-200 bg-blue-50/70 shadow-[0_0_0_1px_rgba(59,130,246,0.05)]'
	}`}
>
	<div class="flex items-start justify-between gap-3">
		<button
			type="button"
			class="min-w-0 flex-1 text-left"
			onclick={() => onOpen(notification)}
			disabled={pending}
		>
			<p
				class={`text-sm ${notification.read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'}`}
			>
				{notification.message}
			</p>
			{#if notification.articleTitle && !compact}
				<p class="mt-1 text-xs text-gray-500">Article: {notification.articleTitle}</p>
			{/if}
			<p class="mt-2 text-xs text-gray-500">{formatDateTime(notification.createdAt)}</p>
		</button>

		<div class="flex shrink-0 items-center gap-2">
			{#if !notification.read}
				<span class="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true"></span>
				<button
					type="button"
					class="rounded-full border border-blue-200 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
					onclick={() => onMarkRead(notification)}
					disabled={pending}
				>
					Mark read
				</button>
			{/if}
		</div>
	</div>
</article>
