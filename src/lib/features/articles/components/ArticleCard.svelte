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
	class="group flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
>
	<a href={articleLink()} class="aspect-video overflow-hidden rounded-xl bg-slate-100">
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
			class="line-clamp-2 text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600"
		>
			{article.title}
		</a>

		<p class="line-clamp-2 flex-1 text-sm text-slate-600">
			content={article?.content ? article.content.substring(0, 160) + '...' : ''}
		</p>

		<div class="flex items-center justify-between pt-2">
			<div class="flex items-center gap-2">
				<a href={authorLink()}>
					<img
						class="h-8 w-8 rounded-full object-cover ring-2 ring-white"
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
					<a href={authorLink()} class="text-xs font-medium text-slate-900 hover:text-blue-600">
						{author.displayName}
					</a>
				</div>
			</div>
		</div>
	</div>
</div>
