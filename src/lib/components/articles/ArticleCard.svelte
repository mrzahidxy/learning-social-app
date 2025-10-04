<script lang="ts">
    import type { Article } from '$lib/types/article';
    import type { Author } from '$lib/types/author';

    const { article, author } = $props<{ article: Article; author: Author }>();

    const fallbackCoverImage = '/images/placeholder-article.svg';
    const fallbackAuthorImage = '/images/placeholder-avatar.svg';

    const articleLink = $derived(() => `/articles/${article.id}`);
    const authorLink = $derived(() => `/authors/${author.userId}`);
    const tagPreview = $derived(() => article.tags?.slice(0, 2) ?? []);
    const extraTagCount = $derived(() => Math.max((article.tags?.length ?? 0) - tagPreview.length, 0));

    const handleCoverImageError = (event: Event) => {
        const target = event.currentTarget as HTMLImageElement | null;
        if (!target || target.dataset.fallbackApplied === 'true') return;
        target.dataset.fallbackApplied = 'true';
        target.src = fallbackCoverImage;
    };

    const handleAuthorImageError = (event: Event) => {
        const target = event.currentTarget as HTMLImageElement | null;
        if (!target || target.dataset.fallbackApplied === 'true') return;
        target.dataset.fallbackApplied = 'true';
        target.src = fallbackAuthorImage;
    };
</script>

<div class="group flex h-full flex-col gap-4 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
    <a href={articleLink()} class="aspect-video overflow-hidden rounded-lg">
        <img
            src={article.coverImage || fallbackCoverImage}
            onerror={handleCoverImageError}
            alt={article.title}
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            width="400"
            height="225"
            loading="lazy"
            decoding="async"
        />
    </a>

    <div class="flex flex-1 flex-col gap-3">
        <div class="flex flex-wrap gap-2">
            {#each tagPreview() as tag}
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {tag}
                </span>
            {/each}
            {#if extraTagCount() > 0}
                <span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                    +{extraTagCount()} more
                </span>
            {/if}
        </div>

        <a href={articleLink()} class="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
            {article.title}
        </a>

        <p class="line-clamp-3 flex-1 text-sm text-gray-600">
            {article.excerpt}
        </p>

        <div class="flex items-center justify-between pt-2">
            <div class="flex items-center gap-2">
                <a href={authorLink()}>
                    <img
                        class="h-8 w-8 rounded-full object-cover"
                        src={author.profileImage || fallbackAuthorImage}
                        onerror={handleAuthorImageError}
                        alt={author.displayName}
                        width="32"
                        height="32"
                        loading="lazy"
                        decoding="async"
                    />
                </a>
                <div>
                    <a href={authorLink()} class="text-xs font-medium text-gray-900 hover:text-blue-600">
                        {author.displayName}
                    </a>
                    <p class="text-xs text-gray-500">{article.readingTime}</p>
                </div>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1" aria-label={`${article.views} views`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                            fill-rule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    {article.views}
                </span>
                <span class="flex items-center gap-1" aria-label={`${article.likes} likes`}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                            fill-rule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    {article.likes}
                </span>
            </div>
        </div>
    </div>
</div>