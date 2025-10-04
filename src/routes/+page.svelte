<script lang="ts">
	import articlesData from '$lib/data/articles.json';
	import authorsData from '$lib/data/authors.json';
	import ArticleCard from '$lib/components/articles/ArticleCard.svelte';
	import ArticleFilters from '$lib/components/articles/ArticleFilters.svelte';
	import type { Article, RawArticleData } from '$lib/types/article';
	import type { Author, RawAuthorData } from '$lib/types/author';

	type ArticleWithAuthor = Article & { author: Author };

	const fallbackAuthor: Author = {
		userId: 'unknown',
		role: 'AUTHOR',
		displayName: 'Guest Author',
		bio: 'Author details coming soon.',
		profileImage: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		articleCount: 0,
		subscriberCount: 0
	};

	let searchTerm = $state('');
	let sortOption = $state('latest');
	let currentPage = $state(1);
	const ITEMS_PER_PAGE = 6;
	let showError = $state(false);
	let isLoading = $state(false);

	const sortArticles = (entries: ArticleWithAuthor[]) => {
		const sorted = [...entries];

		switch (sortOption) {
			case 'popular':
				return sorted.sort((a, b) => b.views - a.views);
			case 'latest':
			default:
				return sorted.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
		}
	};

	const filteredArticles = $derived(() => {
		// Create the dataset by combining articles with their authors
		const articles: Article[] = (articlesData as RawArticleData[]).map((item) => ({
			id: item.id,
			title: item.title,
			subtitle: item.subtitle,
			excerpt: item.excerpt,
			summary: item.summary,
			coverImage: item.coverImage,
			tags: item.tags,
			publishedAt: new Date(item.publishedAt),
			updatedAt: new Date(item.updatedAt),
			readingTime: item.readingTime,
			views: item.views,
			likes: item.likes,
			authorId: item.authorId,
			content: item.content,
			keyTakeaways: item.keyTakeaways,
			recommendedTools: item.recommendedTools
		}));

		const authors: Author[] = (authorsData as RawAuthorData[]).map((author) => ({
			userId: author.userId,
			role: (author.role as Author['role']) ?? 'AUTHOR',
			displayName: author.displayName,
			bio: author.bio,
			profileImage: author.profileImage,
			createdAt: new Date(author.createdAt),
			updatedAt: new Date(author.updatedAt),
			articleCount: author.articleCount,
			subscriberCount: author.subscriberCount
		}));

		const dataset: ArticleWithAuthor[] = articles.map((article) => ({
			...article,
			author: authors.find((author) => author.userId === article.authorId) ?? fallbackAuthor
		}));

		let result = [...dataset];

		// Apply search filter
		const term = searchTerm?.trim().toLowerCase();
		const filtered = term
			? result.filter(
					(article) =>
						article.title.toLowerCase().includes(term) ||
						article.summary.toLowerCase().includes(term) ||
						article.author.displayName?.toLowerCase().includes(term)
				)
			: result;

		// Apply sorting
		return sortArticles(filtered);
	});

	const displayedArticles = $derived(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		const end = start + ITEMS_PER_PAGE;
		return filteredArticles().slice(start, end);
	});

	const hasMore = $derived(() => {
		return currentPage * ITEMS_PER_PAGE < filteredArticles().length;
	});

	const loadMore = () => {
		if (hasMore()) {
			currentPage += 1;
		}
	};

	const resultSummary = () => {
		const total = filteredArticles().length;
		const start = (currentPage - 1) * ITEMS_PER_PAGE + 1;
		const end = Math.min(currentPage * ITEMS_PER_PAGE, total);

		if (total === 0) {
			return 'No articles found';
		}

		return `Showing ${start}-${end} of ${total} articles`;
	};

	$inspect(searchTerm);
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
			<ArticleFilters bind:searchTerm bind:sortOption bind:currentPage />
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
	{:else if !showError && displayedArticles().length === 0}
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
			{#each displayedArticles() as entry (entry.id)}
				<ArticleCard article={entry} author={entry.author} />
			{/each}
		</div>
	{/if}

	{#if hasMore() && !isLoading && displayedArticles().length > 0}
		<div class="flex justify-center">
			<button
				onclick={loadMore}
				class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Load More
			</button>
		</div>
	{/if}
</section>
