<script lang="ts">
  import articlesData from '$lib/data/articles.json';
  import authorsData from '$lib/data/authors.json';
  import type { Article, RawArticleData } from '$lib/types/article';
  import type { Author, RawAuthorData } from '$lib/types/author';
  import { getInitials } from '$lib/utils/common';
  import { formatDate } from '$lib/utils/date';

  export let articleId: string;

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

  type ArticleWithAuthor = Article & { author: Author };

  const dataset: ArticleWithAuthor[] = articles.map((article) => ({
    ...article,
    author: authors.find((author) => author.userId === article.authorId) ?? fallbackAuthor
  }));

  const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
  const formatRole = (role: Author['role']) => role.charAt(0) + role.slice(1).toLowerCase();

  let isLoading = $state(false);
  let showError = $state(false);

  const requestedArticle = $derived(() => dataset.find((entry) => entry.id === articleId));
  const article = $derived<ArticleWithAuthor | null>(() => requestedArticle ?? dataset[0] ?? null);
  const notFound = $derived(() => !requestedArticle && dataset.length > 0);
  const relatedArticles = $derived(() =>
    article ? dataset.filter((entry) => entry.id !== article.id).slice(0, 3) : []
  );
</script>

<svelte:head>
  <title>{article ? `${article.title} | Article` : 'Article Details'}</title>
  <meta name="description" content={article ? article.summary : 'Read detailed article insights and practical steps.'} />
</svelte:head>

{#if dataset.length === 0}
  <section class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
    <div class="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
      <h1 class="text-xl font-semibold text-gray-900">No articles available yet</h1>
      <p class="mt-2 text-sm text-gray-600">Content will appear here once articles have been added.</p>
    </div>
  </section>
{:else}
  <main class="min-h-screen bg-gray-50 text-gray-900">
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-indigo-600">
        <a class="hover:underline" href="/">Home</a>
        <span class="text-gray-400">/</span>
        <span aria-current="page" class="truncate text-gray-600">{article?.title ?? 'Article'}</span>
      </nav>

      {#if showError}
        <div role="alert" class="rounded-lg border border-red-400 bg-red-50 p-4 text-red-700">
          <p class="font-medium">We could not load this article.</p>
          <p class="text-sm">Please try refreshing the page.</p>
        </div>
      {/if}

      {#if isLoading}
        <section class="flex flex-col gap-6" aria-busy="true" aria-live="polite">
          <div class="h-8 w-64 rounded bg-gray-200"></div>
          <div class="h-5 w-3/4 rounded bg-gray-200"></div>
          <div class="h-5 w-5/6 rounded bg-gray-200"></div>
          <div class="h-72 w-full rounded-xl bg-gray-200"></div>
          <div class="space-y-4">
            <div class="h-4 w-full rounded bg-gray-200"></div>
            <div class="h-4 w-11/12 rounded bg-gray-200"></div>
            <div class="h-4 w-4/5 rounded bg-gray-200"></div>
          </div>
        </section>
      {:else if !article}
        <section class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
          <svg aria-hidden="true" class="h-12 w-12 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-6l-2 2m8-4-3 8m5-10-4 12" />
          </svg>
          <div>
            <h1 class="text-xl font-semibold">Article not found</h1>
            <p class="mt-2 text-sm text-gray-600">Return to the directory to browse available topics.</p>
          </div>
          <a
            href="/"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Back to Articles
          </a>
        </section>
      {:else}
        <article class="flex flex-col gap-12">
          {#if notFound}
            <div role="status" class="rounded-lg border border-amber-400 bg-amber-50 p-4 text-amber-700">
              <p class="font-medium">We could not find the requested article.</p>
              <p class="text-sm">Showing a featured piece instead.</p>
            </div>
          {/if}

          <header class="flex flex-col gap-6">
            <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{article.title}</h1>
            <p class="text-base text-gray-600">{article.subtitle}</p>
            <div class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <a
                  class="font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  href={`/authors/${article.author.userId}`}
                >
                  {article.author.displayName ?? 'Unknown Author'}
                </a>
                <span class="hidden h-1 w-1 rounded-full bg-gray-400 sm:inline"></span>
                <span>{formatRole(article.author.role)}</span>
              </div>
              <div class="flex flex-wrap items-center gap-3">
                <span>{formatDate(article.publishedAt)}</span>
                <span class="hidden h-1 w-1 rounded-full bg-gray-400 sm:inline"></span>
                <span>{article.readingTime} read</span>
                <span class="hidden h-1 w-1 rounded-full bg-gray-400 sm:inline"></span>
                <span>{formatNumber(article.views)} views</span>
                <span class="hidden h-1 w-1 rounded-full bg-gray-400 sm:inline"></span>
                <span>{formatNumber(article.likes)} applause</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-2">
              {#each article.tags as tag (tag)}
                <span class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {tag}
                </span>
              {/each}
            </div>
          </header>

          <section class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {#if article.coverImage}
              <img
                src={article.coverImage}
                alt={`Cover image for ${article.title}`}
                class="h-80 w-full object-cover"
                loading="lazy"
              />
            {:else}
              <div class="flex h-80 w-full items-center justify-center bg-gradient-to-br from-indigo-500/80 via-indigo-600/80 to-indigo-700/80 text-5xl font-semibold text-white">
                {getInitials(article.title)}
              </div>
            {/if}
          </section>

          <section class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
            <div class="space-y-6">
              <p class="text-lg text-gray-700">{article.summary}</p>
              <div class="space-y-5 text-base leading-relaxed text-gray-700">
                {#each article.content as paragraph, index (index)}
                  <p>{paragraph}</p>
                {/each}
              </div>

              {#if article.keyTakeaways.length > 0}
                <div class="rounded-xl border border-indigo-200 bg-indigo-50/60 p-6 text-sm text-indigo-900 shadow-sm">
                  <h2 class="text-base font-semibold">Key takeaways</h2>
                  <ul class="mt-3 space-y-2 list-disc pl-5">
                    {#each article.keyTakeaways as item (item)}
                      <li>{item}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </div>

            <aside class="flex flex-col gap-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div class="flex flex-col items-center gap-3 text-center">
                {#if article.author.profileImage}
                  <img
                    src={article.author.profileImage}
                    alt={`Avatar for ${article.author.displayName ?? 'Author'}`}
                    class="h-16 w-16 rounded-full object-cover"
                    loading="lazy"
                  />
                {:else}
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white">
                    {getInitials(article.author.displayName)}
                  </div>
                {/if}
                <div>
                  <a
                    class="text-base font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    href={`/authors/${article.author.userId}`}
                  >
                    {article.author.displayName ?? 'Unknown Author'}
                  </a>
                  <p class="text-sm text-gray-500">{formatRole(article.author.role)}</p>
                </div>
                {#if article.author.bio}
                  <p class="text-sm text-gray-600">{article.author.bio}</p>
                {/if}
              </div>
              <div class="flex flex-col gap-3">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Subscribe
                </button>
                <a
                  class="inline-flex items-center justify-center rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  href={`/authors/${article.author.userId}`}
                >
                  View Author Details
                </a>
              </div>
              {#if article.recommendedTools.length > 0}
                <div>
                  <h2 class="text-sm font-semibold text-gray-700">Tools mentioned</h2>
                  <ul class="mt-2 space-y-2 text-sm text-gray-600">
                    {#each article.recommendedTools as tool (tool)}
                      <li class="rounded-lg bg-gray-100 px-3 py-2">{tool}</li>
                    {/each}
                  </ul>
                </div>
              {/if}
            </aside>
          </section>

          {#if relatedArticles.length > 0}
            <section aria-labelledby="related-heading" class="space-y-6">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 id="related-heading" class="text-xl font-semibold text-gray-900">Continue reading</h2>
                <a class="text-sm font-medium text-indigo-600 hover:text-indigo-700" href="/">Browse all articles</a>
              </div>
              <div class="grid gap-6 sm:grid-cols-2">
                {#each relatedArticles as related (related.id)}
                  <article class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-indigo-500 hover:shadow-md">
                    <div class="flex items-center gap-3 text-sm text-gray-500">
                      {#if related.author.profileImage}
                        <img
                          src={related.author.profileImage}
                          alt={`Avatar for ${related.author.displayName ?? 'Author'}`}
                          class="h-10 w-10 rounded-full object-cover"
                          loading="lazy"
                        />
                      {:else}
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                          {getInitials(related.author.displayName)}
                        </div>
                      {/if}
                      <div>
                        <a
                          class="font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          href={`/authors/${related.author.userId}`}
                        >
                          {related.author.displayName ?? 'Unknown Author'}
                        </a>
                        <p class="text-xs text-gray-500">{formatDate(related.publishedAt)}</p>
                      </div>
                    </div>
                    <a
                      class="text-lg font-semibold text-gray-900 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      href={`/articles/${related.id}`}
                    >
                      {related.title}
                    </a>
                    <p class="line-clamp-3 text-sm text-gray-600">{related.excerpt}</p>
                    <div class="flex flex-wrap gap-2 pt-1">
                      {#each related.tags.slice(0, 2) as tag (tag)}
                        <span class="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                          {tag}
                        </span>
                      {/each}
                    </div>
                  </article>
                {/each}
              </div>
            </section>
          {/if}
        </article>
      {/if}
    </section>
  </main>
{/if}