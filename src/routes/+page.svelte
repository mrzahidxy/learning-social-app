<script lang="ts">
	import { goto } from '$app/navigation';
	import ArticleCard from '$lib/features/articles/components/ArticleCard.svelte';
	import ArticleFilters from '$lib/features/articles/components/ArticleFilters.svelte';
	import NextIcon from '$lib/shared/icons/NextIcon.svelte';
	import PreviousIcon from '$lib/shared/icons/PreviousIcon.svelte';
	import type { Article } from '$lib/features/articles/types';
	import type { Author } from '$lib/features/authors/types';
	import type { PageData } from './$types';

	type ArticleWithAuthor = Article & { author: Author | null };
	type Tab = 'home' | 'flows';

	const { data } = $props<{ data: PageData }>();

	const articles = $derived((data?.articles ?? []) as ArticleWithAuthor[]);
	const pagination = $derived(
		data?.pagination ?? {
			page: 1,
			pageSize: articles.length,
			totalItems: articles.length,
			totalPages: articles.length ? 1 : 0,
			hasNext: false,
			hasPrev: false
		}
	);
	const filters = $derived(data?.filters ?? {});
	const flowsAuthRequired = $derived(Boolean(data?.flowsAuthRequired));

	let searchTerm = $state('');
	let sortOption = $state<'latest' | 'default'>('latest');
	let currentPage = $state(1);
	let tab = $state<Tab>('home');

	$effect(() => {
		currentPage = pagination.page ?? 1;
		searchTerm = filters.search ?? '';
		sortOption = (filters.sort ?? 'latest') as 'latest' | 'default';
		tab = (filters.tab ?? 'home') as Tab;
	});

	const fallbackAuthor: Author = {
		userId: 'unknown',
		role: 'AUTHOR',
		displayName: 'Guest Author',
		bio: 'Author details coming soon.',
		profileImage: null,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const navigateWithFilters = (overrides: { page?: number; tab?: Tab } = {}) => {
		const params = new URLSearchParams();
		const trimmed = searchTerm.trim();
		const targetPage = overrides.page ?? currentPage;
		const targetTab = overrides.tab ?? tab;

		if (trimmed) params.set('q', trimmed);
		if (sortOption) params.set('sort', sortOption);
		if (targetPage > 1) params.set('page', String(targetPage));
		if (targetTab !== 'home') params.set('tab', targetTab);

		goto(params.size ? `?${params.toString()}` : '/', {
			replaceState: true,
			invalidateAll: true
		});
	};

	const handleFiltersSubmit = (event: Event) => {
		event.preventDefault();
		navigateWithFilters({ page: 1 });
	};

	const handleTabChange = (nextTab: Tab) => {
		if (tab === nextTab) return;
		tab = nextTab;
		currentPage = 1;
		navigateWithFilters({ tab: nextTab, page: 1 });
	};

	const goToPrev = () => {
		if (pagination.hasPrev) {
			navigateWithFilters({ page: pagination.page - 1 });
		}
	};

	const goToNext = () => {
		if (pagination.hasNext) {
			navigateWithFilters({ page: pagination.page + 1 });
		}
	};

	const resultSummary = () => {
		if (!pagination.totalItems) return 'No articles found';
		const start = (pagination.page - 1) * pagination.pageSize + 1;
		const end = Math.min(pagination.page * pagination.pageSize, pagination.totalItems);
		return `Showing ${start}-${end} of ${pagination.totalItems} articles`;
	};

	$inspect(sortOption);
</script>

<svelte:head>
	<title>Home | Latest Articles</title>
	<meta
		name="description"
		content="Browse highlighted articles from our authors directly on the home page."
	/>
</svelte:head>

<div class="bg-slate-50">
	<section class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
		<header class="flex flex-col gap-5">
			<div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
				<div>
					<h1 class="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
						{tab === 'flows' ? 'Your Flows' : 'Latest Articles'}
					</h1>
					<p class="mt-2 text-sm text-slate-600 sm:text-base">
						{tab === 'flows'
							? 'Articles from authors you follow'
							: 'Explore curated insights from our writing community'}
					</p>
				</div>
				<div class="text-sm text-slate-500">
					<span aria-live="polite">{resultSummary()}</span>
				</div>
			</div>

			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div class="flex flex-row items-center gap-2">
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-sm font-medium transition ${
							tab === 'home'
								? 'bg-blue-600 text-white shadow-sm'
								: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
						}`}
						onclick={() => handleTabChange('home')}
					>
						Home
					</button>
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-sm font-medium transition ${
							tab === 'flows'
								? 'bg-blue-600 text-white shadow-sm'
								: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100'
						}`}
						onclick={() => handleTabChange('flows')}
					>
						Flows
					</button>
				</div>

				<form
					class="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end"
					onsubmit={handleFiltersSubmit}
				>
					<div class="w-full sm:max-w-md">
						<ArticleFilters bind:searchTerm bind:sortOption bind:currentPage />
					</div>
					<button
						type="submit"
						class="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
					>
						Apply
					</button>
				</form>
			</div>
		</header>

		{#if flowsAuthRequired}
			<div role="alert" class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
				<p class="font-medium">Sign in to view your flows</p>
				<p class="text-sm">Follow authors to see their articles here.</p>
			</div>
		{:else if articles.length === 0}
			<div
				class="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center"
			>
				<p class="text-sm font-medium text-slate-800">Welcome!</p>
				<p class="text-sm text-slate-500">No articles yet. Check back soon.</p>
			</div>
		{:else}
			<div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
				{#each articles as entry (entry.id)}
					<ArticleCard article={entry} author={entry.author ?? fallbackAuthor} />
				{/each}
			</div>
		{/if}

		{#if pagination.totalPages > 1}
			<div class="flex items-center justify-center gap-2 pt-2">
				<button
					type="button"
					onclick={goToPrev}
					class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!pagination.hasPrev}
					aria-label="Previous page"
				>
					<PreviousIcon size={16} />
				</button>

				<div class="flex items-center">
					<span
						class="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
					>
						Page {pagination.page} of {pagination.totalPages}
					</span>
				</div>

				<button
					type="button"
					onclick={goToNext}
					class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={!pagination.hasNext}
					aria-label="Next page"
				>
					<NextIcon size={16} />
				</button>
			</div>
		{/if}
	</section>
</div>
