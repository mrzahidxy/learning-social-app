<script lang="ts">
	import ArticleCard from '$lib/components/articles/ArticleCard.svelte';
	import { marked } from 'marked';

	// Get data from the page data
	let {data} = $props();

	// State for image sources
	let coverImageSrc: string = $state(data?.article?.coverImage || '/images/placeholder-article.svg')
	let authorImageSrc: string =  $state(data?.author?.profileImage || '/images/placeholder-avatar.svg')

	// Format the published date
	const formattedDate = $derived(() => {
		if (!data?.article?.publishedAt) return '';
		return new Date(data.article.publishedAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});

	// Convert content paragraphs to HTML
	const contentHtml = $derived(() => {
		if (!data?.article?.content) return [];
		return data.article.content.map((paragraph: any) => marked.parse(paragraph));
	});

	// Handle like button click
	const handleLike = () => {
		// In a real app, this would make an API call to update the like count
		console.log('Liked article:', data?.article?.id);
	};

	// Handle share button click
	const handleShare = async () => {
		// In a real app, this would trigger the share API or show share options
		console.log('Share article:', data?.article?.id);
	};

	// Handle cover image error
	function handleCoverImageError() {
		coverImageSrc = '/images/placeholder-article.svg';
	}

	// Handle author image error
	function handleAuthorImageError() {
		authorImageSrc = '/images/placeholder-avatar.svg';
	}
</script>

<svelte:head>
	<title>{data?.article?.title || 'Article'}</title>
	<meta name="description" content={data?.article?.excerpt || ''} />
</svelte:head>

<article class="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="mb-12 border-b border-gray-200 pb-8">
		<div class="mb-6 flex flex-wrap gap-2">
			{#each data?.article?.tags || [] as tag}
				<span class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
					{tag}
				</span>
			{/each}
		</div>

		<h1 class="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
			{data?.article?.title || 'Untitled'}
		</h1>

		{#if data?.article?.subtitle}
			<h2 class="mb-6 text-xl text-gray-700">{data.article.subtitle}</h2>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-4">
			{#if data?.author}
				<a
					href="/authors/{data.author.userId}"
					class="flex items-center gap-4 font-medium text-gray-900 hover:text-blue-600"
				>
					<img
						class="h-12 w-12 rounded-full object-cover"
						src={authorImageSrc}
						onerror={handleAuthorImageError}
						alt={data.author.displayName}
						width="48"
						height="48"
					/>
					<div>
						<span class="block">{data.author.displayName}</span>
						<p class="mt-1 text-sm text-gray-500">
							{formattedDate()} · {data?.article?.readingTime || '0 min'} read
						</p>
					</div>
				</a>
			{/if}

			<div class="flex gap-4">
				<button
					class="flex items-center gap-1 text-gray-500 hover:text-red-500"
					aria-label="Like this article"
					onclick={handleLike}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
							clip-rule="evenodd"
						/>
					</svg>
					<span>{data?.article?.likes || 0}</span>
				</button>
				<button
					class="flex items-center gap-1 text-gray-500 hover:text-blue-500"
					aria-label="Share this article"
					onclick={handleShare}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"
						/>
					</svg>
				</button>
			</div>
		</div>
	</header>

	<div class="mb-12 overflow-hidden rounded-xl">
		<img
			src={coverImageSrc}
			onerror={handleCoverImageError}
			alt={data?.article?.title || 'Article cover image'}
			class="w-full object-cover"
			width="800"
			height="400"
		/>
	</div>

	<div class="prose prose-lg max-w-none">
		{#each contentHtml() as paragraph, i}
			<div>{@html paragraph}</div>
		{/each}
	</div>

	{#if data?.article?.keyTakeaways?.length > 0}
		<div class="my-12 rounded-xl bg-blue-50 p-6">
			<h3 class="mb-4 text-xl font-bold text-blue-800">Key Takeaways</h3>
			<ul class="space-y-2">
				{#each data.article.keyTakeaways as takeaway}
					<li class="flex items-start">
						<span class="mr-2 text-blue-500">•</span>
						<span>{takeaway}</span>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if data?.article?.recommendedTools?.length > 0}
		<div class="my-12">
			<h3 class="mb-4 text-xl font-bold text-gray-900">Recommended Tools</h3>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
				{#each data.article.recommendedTools as tool}
					<div class="rounded-lg border border-gray-200 p-4">
						<h4 class="font-medium text-gray-900">{tool}</h4>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<footer class="mt-12 border-t border-gray-200 pt-8">
		<div class="flex flex-wrap items-center justify-between gap-4">
			{#if data?.author}
				<div class="flex items-center gap-4">
					<img
						class="h-12 w-12 rounded-full object-cover"
						src={authorImageSrc}
						onerror={handleAuthorImageError}
						alt={data.author.displayName}
						width="48"
						height="48"
					/>
					<div>
						<p class="font-medium text-gray-900">{data.author.displayName}</p>
						<p class="text-sm text-gray-500">
							{data.author.articleCount || 0} articles · {data.author.subscriberCount || 0} subscribers
						</p>
					</div>
				</div>
				<button
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					Follow
				</button>
			{/if}
		</div>

		{#if data?.author?.bio}
			<p class="mt-4 text-gray-600">{data.author.bio}</p>
		{/if}
	</footer>

	{#if data?.relatedArticles?.length > 0}
		<section class="mt-16">
			<h3 class="mb-6 text-2xl font-bold text-gray-900">More from {data?.author?.displayName || 'the author'}</h3>
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.relatedArticles as relatedArticle (relatedArticle.id)}
					<ArticleCard article={relatedArticle} author={data.author} />
				{/each}
			</div>
		</section>
	{/if}
</article>