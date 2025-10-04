<script lang="ts">
	let {
		searchTerm = $bindable(''),
		sortOption = $bindable('latest'),
		currentPage = $bindable(1)
	} = $props();

	const resetPage = () => {
		currentPage = 1;
	};
</script>

<div class="flex flex-col gap-3 rounded-lg">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
		<div class="relative flex-1">
			<span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
				<svg
					aria-hidden="true"
					class="h-4 w-4"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					viewBox="0 0 24 24"
				>
					<path
						d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</span>
			<input
				id="article-search"
				type="search"
				placeholder="Search articles..."
				class="w-1/2 rounded-lg border border-gray-200 bg-white py-1.5 pr-3 pl-9 text-sm shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
				bind:value={searchTerm}
				aria-label="Search articles"
				oninput={resetPage}
			/>
		</div>
		<div class="flex items-center">
			<label class="sr-only" for="article-sorter">Sort</label>
			<select
				id="article-sorter"
				class="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none"
				bind:value={sortOption}
				onchange={resetPage}
			>
				<option value="latest">Newest</option>
				<option value="popular">Most Views</option>
			</select>
		</div>
	</div>
</div>
