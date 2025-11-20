<script lang="ts">
	import NextIcon from '$lib/icons/NextIcon.svelte';
	import PreviousIcon from '$lib/icons/PreviousIcon.svelte';

	let {
		page = 1,
		totalPages = 1,
		hasPrev = false,
		hasNext = false,
		onPrev,
		onNext,
		ariaLabel = 'Pagination'
	} = $props();

	const handlePrev = () => {
		if (hasPrev) {
			onPrev?.();
		}
	};

	const handleNext = () => {
		if (hasNext) {
			onNext?.();
		}
	};
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-center gap-2" aria-label={ariaLabel}>
		<button
			type="button"
			onclick={handlePrev}
			class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!hasPrev}
			aria-label="Previous page"
		>
			<PreviousIcon size={16} />
		</button>

		<div class="flex items-center">
			<span class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
				Page {page} of {totalPages}
			</span>
		</div>

		<button
			type="button"
			onclick={handleNext}
			class="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={!hasNext}
			aria-label="Next page"
		>
			<NextIcon size={16} />
		</button>
	</div>
{/if}
