<script lang="ts">
	import { marked } from 'marked';

	import { handleImageError } from '$lib/utils/common';
	import SaveIcon from '$lib/icons/SaveIcon.svelte';
	import ArticleCard from '$lib/components/articles/ArticleCard.svelte';
	import ShareIcon from '$lib/icons/ShareIcon.svelte';
	import PageWrapper from '$lib/components/PageWrapper.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	const fallbackCoverImage = '/images/placeholder-article.svg';
	const fallbackAuthorImage = '/images/placeholder-avatar.svg';

	const handleCoverImageError = (event: Event) => {
		handleImageError(event, fallbackCoverImage);
	};

	const handleAuthorImageError = (event: Event) => {
		handleImageError(event, fallbackAuthorImage);
	};

	// Convert content paragraphs to HTML
	const contentHtml = $derived(() => {
		if (!data?.article?.content) return [];

		// Handle case where content is a single string
		const contentArray =
			typeof data.article.content === 'string'
				? [data.article.content]
				: Array.isArray(data.article.content)
					? data.article.content
					: [];

		return contentArray.map((paragraph: string) => {
			// Handle empty or whitespace-only paragraphs
			if (!paragraph.trim()) {
				return '';
			}

			// Parse markdown to HTML
			return marked.parse(paragraph);
		});
	});

	const handleSave = () => {
		console.log('Saves article:', data?.article?.id);
	};

	const articleLink = $derived(`/articles/${data?.article?.id ?? ''}`);
	const shareSupported = $derived(browser && typeof navigator.share === 'function');

	const buildShareUrl = () => {
		if (!browser) return articleLink;
		return new URL(articleLink, window.location.origin).toString();
	};

	const handleShare = async () => {
		const url = buildShareUrl();

		if (shareSupported) {
			try {
				await navigator.share({
					title: data?.article.title,
					text: data?.article?.content ? data.article.content.substring(0, 160) + '...' : '',
					url
				});
				return;
			} catch (error) {
				// Ignore user aborts and continue to copy fallback
				if ((error as DOMException).name !== 'AbortError') {
					console.error('Share failed, falling back to copy', error);
				}
			}
		}
	};
</script>

<svelte:head>
	<title>{data?.article?.title || 'Article'}</title>
	<meta
		name="description"
		content={data?.article?.content ? data.article.content.substring(0, 160) + '...' : ''}
	/>
</svelte:head>

<PageWrapper paddingX="px-2" paddingY="py-6" class="sm:px-4 lg:px-6">
	<article>
		<header class="mb-8 border-b border-gray-200 pb-6">
			<h1 class="mb-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
				{data?.article?.title || 'Untitled'}
			</h1>

			<div class="flex flex-wrap items-center justify-between gap-3">
				{#if data?.author}
					<a
						href={'/authors/' + data?.author.userId}
						class="flex items-center gap-3 font-medium text-gray-900 hover:text-blue-600"
					>
						<img
							class="h-10 w-10 rounded-full object-cover"
							src={data?.author.profileImage || fallbackAuthorImage}
							onerror={handleAuthorImageError}
							alt={data?.author.displayName}
							width="40"
							height="40"
						/>
						<div class="text-sm">
							<p class="font-medium text-gray-900">{data.article?.author.displayName}</p>
							<p class="text-xs text-gray-500">
								Published on {new Date(data?.article?.createdAt).toLocaleDateString()}
							</p>
						</div>
					</a>
				{/if}

				<div class="flex gap-3">
					<button
						class="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500"
						aria-label="Like this article"
						onclick={handleSave}
					>
						<SaveIcon />
					</button>
					<button
						class="flex cursor-pointer items-center gap-1 text-sm text-gray-500 hover:text-blue-500"
						aria-label="Share this article"
						onclick={handleShare}
					>
						<ShareIcon />
						<span>42</span>
					</button>
				</div>
			</div>
		</header>

		<div class="mb-8 h-96 overflow-hidden rounded-lg">
			<img
				src={data?.article?.imageUrl || fallbackCoverImage}
				onerror={handleCoverImageError}
				alt={data?.article?.title || 'Article cover image'}
				class="h-full w-full object-contain"
			/>
		</div>

		<div class="prose prose-lg max-w-none">
			{#each contentHtml() as paragraph, i}
				<div>{@html paragraph}</div>
			{/each}
		</div>

		<footer class="mt-8 border-t border-gray-200 pt-6">
			<div class="flex flex-wrap items-center justify-between gap-3">
				{#if data?.author}
					<div class="flex items-center gap-3">
						<img
							class="h-12 w-12 rounded-full object-cover"
							src={data?.author.profileImage || fallbackAuthorImage}
							onerror={handleAuthorImageError}
							alt={data?.author.displayName}
							width="48"
							height="48"
						/>
						<div>
							<p class="font-medium text-gray-900">{data?.author.displayName}</p>
							<p class="text-sm text-gray-500">0 articles · 0 subscribers</p>
						</div>
					</div>
					<button
						class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
					>
						Follow
					</button>
				{/if}
			</div>

			{#if data?.author?.bio}
				<p class="mt-3 text-sm text-gray-600">{data.author.bio}</p>
			{/if}
		</footer>

		{#if data?.relatedArticles?.length > 0}
			<section class="mt-12">
				<h3 class="mb-4 text-xl font-bold text-gray-900">
					More from {data?.author?.displayName || 'the author'}
				</h3>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.relatedArticles as relatedArticle (relatedArticle.id)}
						<ArticleCard article={relatedArticle} author={data.author} />
					{/each}
				</div>
			</section>
		{/if}
	</article>
</PageWrapper>
