<script lang="ts">
	import { goto } from '$app/navigation';
	import ArticleCard from '$lib/components/articles/ArticleCard.svelte';
	import ArticleFilters from '$lib/components/articles/ArticleFilters.svelte';
	import NextIcon from '$lib/icons/NextIcon.svelte';
	import PreviousIcon from '$lib/icons/PreviousIcon.svelte';
	import type { Article } from '$lib/types/article';
	import type { Author } from '$lib/types/author';

	type ArticleWithAuthor = Article & { author: Author | null };

	const props = $props();
	const data = $derived(props.data);
	const articles = $derived(data?.articles as ArticleWithAuthor[]);

	const fallbackAuthor: Author = {
		userId: 'unknown',
		role: 'AUTHOR',
		displayName: 'Guest Author',
		bio: 'Author details coming soon.',
		profileImage: null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	let searchTerm = $state('');
	let sortOption = $state<'latest' | 'default'>('latest');
	let currentPage = $state(1);
	let showError = $state(false);
	let isLoading = $state(false);

	$effect(() => {
		currentPage = data?.pagination?.page ?? 1;
		searchTerm = data?.filters?.search ?? '';
		sortOption = (data?.filters?.sort ?? 'latest') as 'latest' | 'default';
	});

	const pagination = $derived(
		() =>
			data?.pagination ?? {
				page: 1,
				pageSize: articles.length,
				totalItems: articles.length,
				totalPages: articles.length ? 1 : 0,
				hasNext: false,
				hasPrev: false
			}
	);

	const navigateWithFilters = (overrides: { page?: number } = {}) => {
		const params = new URLSearchParams();
		const trimmed = searchTerm.trim();
		const targetPage = overrides.page ?? pagination().page;

		if (trimmed) {
			params.set('q', trimmed);
		}

		if (sortOption !== 'latest') {
			params.set('sort', sortOption);
		}

		if (targetPage > 1) {
			params.set('page', String(targetPage));
		}

		goto(params.size ? `?${params.toString()}` : '/', { replaceState: true });
	};

	const handleFiltersSubmit = (e: Event) => {
		e?.preventDefault();
		currentPage = 1;
		navigateWithFilters({ page: 1 });
	};

	const goToPrev = () => {
		if (pagination().hasPrev) {
			navigateWithFilters({ page: pagination().page - 1 });
		}
	};

	const goToNext = () => {
		if (pagination().hasNext) {
			navigateWithFilters({ page: pagination().page + 1 });
		}
	};

	const resultSummary = () => {
		const info = pagination();

		if (!info.totalItems) {
			return 'No articles found';
		}

		const start = (info.page - 1) * info.pageSize + 1;
		const end = Math.min(info.page * info.pageSize, info.totalItems);
		return `Showing ${start}-${end} of ${info.totalItems} articles`;
	};
</script>

<svelte:head>
	<title>Home | Latest Articles</title>
	<meta
		name="description"
		content="Browse highlighted articles from our authors directly on the home page."
	/>
</svelte:head>

<section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
	<header class="flex flex-col gap-4">
		<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
			<div>
				<h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Latest Articles</h1>
				<p class="mt-1 text-sm text-gray-600 sm:text-base">
					Explore curated insights from our writing community
				</p>
			</div>
			<div class="text-sm text-gray-600">
				<span aria-live="polite">{resultSummary()}</span>
			</div>
		</div>

		<div class="w-full">
			<form class="flex-colrow flex gap-4" onsubmit={handleFiltersSubmit}>
				<div class="flex-1">
					<ArticleFilters bind:searchTerm bind:sortOption bind:currentPage />
				</div>
				<div class="pb-1">
					<button
						type="submit"
						class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						Apply
					</button>
				</div>
			</form>
		</div>
	</header>

	{#if showError}
		<div role="alert" class="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
			<p class="font-medium">We couldn't load the articles right now.</p>
			<p class="text-sm">Please refresh or come back in a moment.</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-busy="true">
			{#each Array.from({ length: 6 }, (_, index) => index) as item (item)}
				<article
					class="flex flex-col gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
				>
					<div class="h-40 w-full rounded-lg bg-gray-200"></div>
					<div class="space-y-3">
						<div class="h-4 w-3/4 rounded bg-gray-200"></div>
						<div class="h-3 w-full rounded bg-gray-200"></div>
						<div class="h-3 w-5/6 rounded bg-gray-200"></div>
					</div>
					<div class="flex gap-3">
						<div class="h-6 w-16 rounded-full bg-gray-200"></div>
						<div class="h-6 w-16 rounded-full bg-gray-200"></div>
					</div>
					<div class="mt-auto flex items-center justify-between">
						<div class="h-3 w-24 rounded bg-gray-200"></div>
						<div class="h-9 w-28 rounded bg-gray-200"></div>
					</div>
				</article>
			{/each}
		</div>
	{:else if !showError && articles.length === 0}
		<div
			class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm"
		>
			<svg
				aria-hidden="true"
				class="h-12 w-12 text-gray-300"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h7" />
			</svg>
			<div>
				<h2 class="text-lg font-semibold">No articles match your filters yet</h2>
				<p class="mt-2 text-sm text-gray-600">Try adjusting your search.</p>
			</div>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite" aria-busy={isLoading}>
			{#each articles as entry (entry.id)}
				<ArticleCard article={entry} author={entry.author ?? fallbackAuthor} />
			{/each}
		</div>
	{/if}

	{#if !isLoading && pagination().totalPages > 1}
		<div class="flex items-center justify-center gap-2">
			<button
				type="button"
				onclick={goToPrev}
				class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!pagination().hasPrev}
				aria-label="Previous page"
			>
				<PreviousIcon size={16} />
			</button>

			<div class="flex items-center">
				<span class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700">
					Page {pagination().page} of {pagination().totalPages}
				</span>
			</div>

			<button
				type="button"
				onclick={goToNext}
				class="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:z-20 disabled:cursor-not-allowed disabled:opacity-50"
				disabled={!pagination().hasNext}
				aria-label="Next page"
			>
				<NextIcon size={16} />
			</button>
		</div>
	{/if}
</section>
