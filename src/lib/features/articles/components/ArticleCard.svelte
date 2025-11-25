<script lang="ts">
	import type { Article } from '$lib/features/articles/types';
	import type { Author } from '$lib/features/authors/types';
	import { handleImageError } from '$lib/shared/utils/common';

	const { article, author } = $props<{ article: Article; author: Author }>();

	const fallbackCoverImage = '/images/placeholder-article.svg';
	const fallbackAuthorImage = '/images/placeholder-avatar.svg';

	const articleLink = $derived(() => `/articles/${article.id}`);
	const authorLink = $derived(() => `/authors/${author.userId}`);

	const handleCoverImageError = (event: Event) => {
		handleImageError(event, fallbackCoverImage);
	};

	const handleAuthorImageError = (event: Event) => {
		handleImageError(event, fallbackAuthorImage);
	};
</script>

<div
	class="group flex h-full flex-col gap-3 overflow-hidden rounded-lg border border-gray-300 bg-white p-4 shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
>
	<a href={articleLink()} class="aspect-video overflow-hidden rounded-md">
		<img
			src={article.imageUrl || fallbackCoverImage}
			onerror={handleCoverImageError}
			alt={article.title}
			class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			width="400"
			height="225"
			loading="lazy"
			decoding="async"
		/>
	</a>

	<div class="flex flex-1 flex-col gap-2">
		<a
			href={articleLink()}
			class="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-blue-600"
		>
			{article.title}
		</a>

		<p class="line-clamp-2 flex-1 text-xs text-gray-600">
			content={article?.content ? article.content.substring(0, 160) + '...' : ''}
		</p>

		<div class="flex items-center justify-between pt-1">
			<div class="flex items-center gap-2">
				<a href={authorLink()}>
					<img
						class="h-7 w-7 rounded-full object-cover"
						src={author.profileImage || fallbackAuthorImage}
						onerror={handleAuthorImageError}
						alt={author.displayName}
						width="28"
						height="28"
						loading="lazy"
						decoding="async"
					/>
				</a>
				<div>
					<a href={authorLink()} class="text-xs font-medium text-gray-900 hover:text-blue-600">
						{author.displayName}
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
