<script lang="ts">
	import SearchIcon from '$lib/shared/icons/SearchIcon.svelte';

	let {
		searchTerm = $bindable(''),
		sortOption = $bindable('latest'),
		currentPage = $bindable(1)
	} = $props();

	const resetPage = () => {
		currentPage = 1;
	};
</script>

<div class="flex w-full flex-col gap-3">
	<div class="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative w-full sm:min-w-0 sm:flex-1">
			<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
				<SearchIcon />
			</span>
			<input
				id="article-search"
				type="search"
				placeholder="Search articles..."
				class="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
				bind:value={searchTerm}
				aria-label="Search articles"
				oninput={resetPage}
			/>
		</div>
		<div class="flex w-full items-center sm:w-40 sm:flex-none">
			<label class="sr-only" for="article-sorter">Sort</label>
			<select
				id="article-sorter"
				class="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
				bind:value={sortOption}
				onchange={resetPage}
			>
				<option value="latest">Newest</option>
				<option value="default">Default</option>
			</select>
		</div>
	</div>
</div>
