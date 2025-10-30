<script lang="ts">
  import { invalidateAll, goto } from '$app/navigation';

  type ArticleAuthor = {
    userId: string;
    displayName: string | null;
  } | null;

  type AdminArticle = {
    id: string;
    title: string;
    published: boolean;
    authorUserId: string;
    createdAt: string;
    updatedAt: string;
    author: ArticleAuthor;
  };

  export let data: {
    articles: AdminArticle[];
    pagination: { page: number; pageSize: number; total: number };
    filters: { search: string; status: string };
  };

  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' }
  ];

  let articles = structuredClone(data.articles);
  $: if (data.articles !== undefined) {
    articles = structuredClone(data.articles);
  }

  let searchTerm = data.filters.search ?? '';
  let statusFilter = (data.filters.status as 'all' | 'published' | 'draft') ?? 'all';

  const pending = new Set<string>();
  const errorMap = new Map<string, string>();

  function applyFilters(event: SubmitEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (statusFilter !== 'all') params.set('status', statusFilter);
    goto(`/admin/articles${params.size ? `?${params.toString()}` : ''}`);
  }

  const formatDateTime = (value: string) =>
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));

  async function setPublished(articleId: string, nextState: boolean) {
    pending.add(articleId);
    errorMap.delete(articleId);

    const target = articles.find((article) => article.id === articleId);
    if (!target) {
      pending.delete(articleId);
      return;
    }

    const previousState = target.published;
    target.published = nextState;

    try {
      const res = await fetch(`/api/admin/articles/${articleId}/publish`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ published: nextState })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const payload = await res.json();
      target.published = payload.published;
      target.updatedAt = payload.updatedAt;
      await invalidateAll();
    } catch (err) {
      target.published = previousState;
      errorMap.set(
        articleId,
        err instanceof Error ? err.message : 'Failed to update publish status'
      );
    } finally {
      pending.delete(articleId);
    }
  }
</script>

<section class="mx-auto max-w-6xl space-y-6 px-4 py-8">
  <header class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-2xl font-semibold">Articles</h1>
      <p class="text-sm text-gray-600">Review articles and control their visibility.</p>
    </div>
    <form class="flex flex-col gap-2 sm:flex-row sm:items-center" on:submit={applyFilters}>
      <input
        class="w-56 rounded border border-gray-300 px-3 py-2 text-sm"
        placeholder="Search by title or content"
        bind:value={searchTerm}
        name="q"
      />
      <select
        class="rounded border border-gray-300 px-2 py-2 text-sm"
        bind:value={statusFilter}
        name="status"
      >
        {#each statuses as option}
          <option value={option.value}>{option.label}</option>
        {/each}
      </select>
      <button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white">Filter</button>
    </form>
  </header>

  <table class="w-full table-auto border-collapse rounded-xl border border-gray-200 bg-white shadow-sm">
    <thead class="bg-gray-50 text-left text-sm text-gray-600">
      <tr>
        <th class="px-4 py-3 font-medium">Title</th>
        <th class="px-4 py-3 font-medium">Author</th>
        <th class="px-4 py-3 font-medium">Status</th>
        <th class="px-4 py-3 font-medium">Updated</th>
        <th class="px-4 py-3 font-medium text-right">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#if articles.length === 0}
        <tr>
          <td class="px-4 py-6 text-center text-sm text-gray-500" colspan="5">
            No articles found.
          </td>
        </tr>
      {:else}
        {#each articles as article (article.id)}
          <tr class="border-t text-sm">
            <td class="px-4 py-3">
              <div class="font-medium text-gray-900">{article.title}</div>
              <div class="text-xs text-gray-500">ID: {article.id}</div>
            </td>
            <td class="px-4 py-3">
              {#if article.author}
                <div class="font-medium text-gray-900">{article.author.displayName ?? 'Unnamed'}</div>
                <div class="text-xs text-gray-500">{article.author.userId}</div>
              {:else}
                <span class="text-xs text-gray-500">Unknown author</span>
              {/if}
            </td>
            <td class="px-4 py-3">
              <span
                class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  article.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {article.published ? 'Published' : 'Draft'}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">
              {formatDateTime(article.updatedAt)}
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-3">
                {#if errorMap.has(article.id)}
                  <span class="text-xs text-red-600">{errorMap.get(article.id)}</span>
                {/if}
                <button
                  class={`rounded px-3 py-1 text-sm font-medium text-white ${
                    article.published ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  type="button"
                  on:click={() => setPublished(article.id, !article.published)}
                  disabled={pending.has(article.id)}
                >
                  {#if pending.has(article.id)}
                    Updating...
                  {:else}
                    {article.published ? 'Unpublish' : 'Publish'}
                  {/if}
                </button>
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>

  {#if data.pagination.total > data.pagination.pageSize}
    <footer class="flex items-center justify-between text-sm text-gray-600">
      <span>
        Page {data.pagination.page} of
        {Math.ceil(data.pagination.total / data.pagination.pageSize)}
      </span>
      <div class="space-x-2">
        <a
          class="rounded border px-3 py-1"
          aria-disabled={data.pagination.page <= 1}
          href={data.pagination.page <= 1
            ? '#'
            : `/admin/articles?${new URLSearchParams({
                ...(searchTerm.trim() ? { q: searchTerm.trim() } : {}),
                ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
                page: String(data.pagination.page - 1)
              })}`}
        >
          Previous
        </a>
        <a
          class="rounded border px-3 py-1"
          aria-disabled={
            data.pagination.page >= Math.ceil(data.pagination.total / data.pagination.pageSize)
          }
          href={data.pagination.page >= Math.ceil(data.pagination.total / data.pagination.pageSize)
            ? '#'
            : `/admin/articles?${new URLSearchParams({
                ...(searchTerm.trim() ? { q: searchTerm.trim() } : {}),
                ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
                page: String(data.pagination.page + 1)
              })}`}
        >
          Next
        </a>
      </div>
    </footer>
  {/if}
</section>
