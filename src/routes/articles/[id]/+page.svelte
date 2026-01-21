<script lang="ts">
	import { marked } from 'marked';

	import { handleImageError } from '$lib/shared/utils/common';
	import ArticleCard from '$lib/features/articles/components/ArticleCard.svelte';
	import FollowerIcon from '$lib/shared/icons/FollowerIcon.svelte';
	import ShareIcon from '$lib/shared/icons/ShareIcon.svelte';
	import PageWrapper from '$lib/shared/components/PageWrapper.svelte';
	import { browser } from '$app/environment';

	let { data } = $props();

	const fallbackCoverImage = '/images/placeholder-article.svg';
	const fallbackAuthorImage = '/images/placeholder-avatar.svg';

	let isLoading = false;

	const handleCoverImageError = (event: Event) => {
		handleImageError(event, fallbackCoverImage);
	};

	const handleAuthorImageError = (event: Event) => {
		handleImageError(event, fallbackAuthorImage);
	};

	// Convert content paragraphs to HTML
	const contentHtml = $derived(() => {
		if (!data?.article?.content) return [];

		const contentArray =
			typeof data.article.content === 'string'
				? [data.article.content]
				: Array.isArray(data.article.content)
					? data.article.content
					: [];

		return contentArray.map((paragraph: string) => {
			if (!paragraph.trim()) {
				return '';
			}

			return marked.parse(paragraph);
		});
	});

	const readTime = $derived(() => {
		const content = data?.article?.content;
		if (!content) return '';
		const text = Array.isArray(content) ? content.join(' ') : content;
		const words = text.trim().split(/\s+/).length;
		const minutes = Math.max(1, Math.round(words / 200));
		return `${minutes} min read`;
	});

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
				if ((error as DOMException).name !== 'AbortError') {
					console.error('Share failed, falling back to copy', error);
				}
			}
		}
	};

	let isFollowing = $state<boolean>();

	$effect(() => {
		isFollowing = data?.isSubscribed;
	});

	async function toggleFollow() {
		isLoading = true;
		try {
			const method = isFollowing ? 'DELETE' : 'POST';
			const res = await fetch('/api/subscription', {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ authorUserId: data?.author?.userId })
			});

			if (!res.ok) return;

			isFollowing = method === 'POST';
		} catch (err) {
			console.error('Unable to toggle follow', err);
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>{data?.article?.title || 'Article'}</title>
	<meta
		name="description"
		content={data?.article?.content ? data.article.content.substring(0, 160) + '...' : ''}
	/>
</svelte:head>

<PageWrapper paddingX="px-3" paddingY="py-8" class="sm:px-6 lg:px-8">
	<article class="mx-auto">
		<header class="mb-8 border-b border-gray-200 pb-6">
			<p class="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">Tech Insights</p>
			<h1 class="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
				{data?.article?.title || 'Untitled'}
			</h1>

			<div class="mt-6 flex flex-wrap items-center justify-between gap-4">
				{#if data?.author}
					<a
						href={'/authors/' + data?.author.userId}
						class="flex items-center gap-3 text-sm font-medium text-gray-900 hover:text-blue-600"
					>
						<img
							class="h-9 w-9 rounded-full object-cover"
							src={data?.author.profileImage || fallbackAuthorImage}
							onerror={handleAuthorImageError}
							alt={data?.author.displayName}
							width="36"
							height="36"
						/>
						<div>
							<p class="font-medium text-gray-900">{data.article?.author.displayName}</p>
							<p class="text-xs text-gray-500">
								Published on {new Date(data?.article?.createdAt).toLocaleDateString()}
								{#if readTime()}
									• {readTime()}{/if}
							</p>
						</div>
					</a>
				{/if}

				<div class="flex items-center gap-2">
					<button
						class="flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
						aria-label="Share this article"
						onclick={handleShare}
					>
						<ShareIcon />
						Share
					</button>
				</div>
			</div>
		</header>

		<div class="mb-8 overflow-hidden rounded-3xl border border-gray-100 bg-slate-100">
			<img
				src={data?.article?.imageUrl || fallbackCoverImage}
				onerror={handleCoverImageError}
				alt={data?.article?.title || 'Article cover image'}
				class="h-full w-full object-cover"
			/>
		</div>

		<div class="prose prose-lg max-w-none text-gray-700">
			{#each contentHtml() as paragraph}
				<div>{@html paragraph}</div>
			{/each}
		</div>

		<footer class="mt-12 border-t border-gray-200 pt-8">
			{#if data?.author}
				<div
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
				>
					<div class="flex items-center gap-3">
						<img
							class="h-12 w-12 rounded-2xl object-cover"
							src={data?.author.profileImage || fallbackAuthorImage}
							onerror={handleAuthorImageError}
							alt={data?.author.displayName}
							width="48"
							height="48"
						/>
						<div>
							<p class="text-sm font-semibold text-gray-900">{data?.author.displayName}</p>
							<p class="text-xs text-gray-500">
								{data?.authorStats?.totalArticles} articles • {data?.authorStats?.totalSubscribers} subscribers
							</p>
						</div>
					</div>
					<button
						class={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
							isFollowing
								? 'border border-blue-200 bg-white text-blue-600 hover:bg-blue-50'
								: 'bg-blue-600 text-white hover:bg-blue-700'
						}`}
						aria-pressed={isFollowing}
						aria-label={isFollowing ? 'Unfollow this author' : 'Follow this author'}
						onclick={toggleFollow}
					>
						<FollowerIcon size={16} className={isFollowing ? 'text-blue-600' : 'text-white'} />
						{isFollowing ? 'Following' : 'Follow'}
					</button>
				</div>
			{/if}

			{#if data?.author?.bio}
				<p class="mt-4 text-sm text-gray-600">{data.author.bio}</p>
			{/if}
		</footer>

		{#if data?.relatedArticles?.length > 0}
			<section class="mt-12">
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<span class="h-2 w-2 rounded-full bg-blue-500"></span>
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
