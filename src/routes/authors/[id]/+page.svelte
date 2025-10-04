<script lang="ts">
	import ArticleCard from '$lib/components/articles/ArticleCard.svelte';

	// Define the page data type
	type PageData = {
		author: import('$lib/types/author').Author;
		articles: import('$lib/types/article').Article[];
	};

	// Get data from the page data
	let { data } = $props();

	// State for image sources
	let authorImageSrc: string = $state(data?.author?.profileImage || '/images/placeholder-avatar.svg')

	// Handle author image error
	function handleAuthorImageError() {
		authorImageSrc = '/images/placeholder-avatar.svg';
	}

	// Format the join date
	const formattedDate = $derived(() => {
		if (!data.author.createdAt) return '';
		return new Date(data.author.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	});
</script>

<svelte:head>
	<title>{data.author.displayName} | Author Profile</title>
	<meta name="description" content={data.author.bio || `Articles by ${data.author.displayName}`} />
</svelte:head>

<div class="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="mb-12 rounded-xl bg-white p-6 shadow-sm">
		<div class="flex flex-col items-center gap-6 sm:flex-row">
			<img
				class="h-24 w-24 rounded-full object-cover"
				src={authorImageSrc}
				onerror={handleAuthorImageError}
				alt={data.author.displayName}
				width="96"
				height="96"
			/>
			<div class="text-center sm:text-left">
				<h1 class="text-2xl font-bold text-gray-900 sm:text-3xl">
					{data.author.displayName}
				</h1>
				<p class="mt-2 text-gray-600">
					Member since {formattedDate()}
				</p>
				<div class="mt-4 flex flex-wrap justify-center gap-4 sm:justify-start">
					<div class="flex items-center text-sm text-gray-500">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"
							/>
						</svg>
						{data.articles.length}
						{data.articles.length === 1 ? 'article' : 'articles'}
					</div>
					<div class="flex items-center text-sm text-gray-500">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
							<path
								fill-rule="evenodd"
								d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
								clip-rule="evenodd"
							/>
						</svg>
						{data.author.subscriberCount} followers
					</div>
				</div>
			</div>
			<div class="ml-auto">
				<button
					class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					Follow
				</button>
			</div>
		</div>

		{#if data.author.bio}
			<div class="mt-6 border-t border-gray-200 pt-6">
				<h2 class="text-lg font-semibold text-gray-900">About</h2>
				<p class="mt-2 text-gray-600">{data.author.bio}</p>
			</div>
		{/if}
	</header>

	<section>
		<h2 class="mb-6 text-2xl font-bold text-gray-900">Articles by {data.author.displayName}</h2>

		{#if data.articles.length > 0}
			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.articles as article (article.id)}
					<ArticleCard {article} author={data.author} />
				{/each}
			</div>
		{:else}
			<div
				class="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm"
			>
				<svg
					aria-hidden="true"
					class="mx-auto h-12 w-12 text-gray-300"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
					/>
				</svg>
				<h3 class="mt-4 text-lg font-semibold text-gray-900">No articles yet</h3>
				<p class="mt-2 text-gray-500">This author hasn't published any articles yet.</p>
			</div>
		{/if}
	</section>
</div>
