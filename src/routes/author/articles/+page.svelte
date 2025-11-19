<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { STATUS_OPTIONS } from '$lib/constants/adminArticle';
	import type { AdminArticle } from '$lib/types/article';
	import { formatDateTime } from '$lib/utils/date';

	const props = $props<{
		data: {
			articles: AdminArticle[];
			pagination: { page: number; pageSize: number; total: number };
			filters: { search: string; status: string };
		};
	}>();

	const statuses = STATUS_OPTIONS;

	const data = $derived(props.data);

	let articles = $state([] as AdminArticle[]);
	let searchTerm = $state('');
	let statusFilter = $state<'all' | 'published' | 'draft'>('all');

	const pending = $state(new Set<string>());
	const errorMap = $state(new Map<string, string>());

	$effect(() => {
		articles = structuredClone(data.articles);
		searchTerm = data.filters.search ?? '';
		statusFilter = (data.filters.status as 'all' | 'published' | 'draft') ?? 'all';
	});

	function applyFilters(event: SubmitEvent) {
		event.preventDefault();
		const params = new URLSearchParams();
		const trimmed = searchTerm.trim();
		if (trimmed) params.set('q', trimmed);
		if (statusFilter !== 'all') params.set('status', statusFilter);
		goto(`/author/articles${params.size ? `?${params}` : ''}`);
	}

	async function setPublished(articleId: string, nextState: boolean) {
		pending.add(articleId);
		errorMap.delete(articleId);

		const target = articles.find((article: AdminArticle) => article.id === articleId);
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

			const payload: Pick<AdminArticle, 'published' | 'updatedAt'> = await res.json();
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
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
			<form class="flex flex-col gap-2 sm:flex-row sm:items-center" onsubmit={applyFilters}>
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
				<button class="cursor-pointer rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white"
					>Filter</button
				>
			</form>
			<button
				class="inline-flex cursor-pointer items-center rounded-full border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
				type="button"
				onclick={() => goto('/author/articles/create')}
			>
				Create article
			</button>
		</div>
	</header>

	<table
		class="w-full table-auto border-collapse rounded-xl border border-gray-200 bg-white shadow-sm"
	>
		<thead class="bg-gray-50 text-left text-sm text-gray-600">
			<tr>
				<th class="px-4 py-3 font-medium">Title</th>
				<th class="px-4 py-3 font-medium">Author</th>
				<th class="px-4 py-3 font-medium">Status</th>
				<th class="px-4 py-3 font-medium">Updated</th>
				<th class="px-4 py-3 text-right font-medium">Actions</th>
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
								<div class="font-medium text-gray-900">
									{article.author.displayName ?? 'Unnamed'}
								</div>
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
										article.published
											? 'bg-amber-500 hover:bg-amber-600'
											: 'bg-blue-600 hover:bg-blue-700'
									}`}
									type="button"
									onclick={() => setPublished(article.id, !article.published)}
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
						: `/author/articles?${new URLSearchParams({
								...(searchTerm.trim() ? { q: searchTerm.trim() } : {}),
								...(statusFilter !== 'all' ? { status: statusFilter } : {}),
								page: String(data.pagination.page - 1)
							})}`}
				>
					Previous
				</a>
				<a
					class="rounded border px-3 py-1"
					aria-disabled={data.pagination.page >=
						Math.ceil(data.pagination.total / data.pagination.pageSize)}
					href={data.pagination.page >= Math.ceil(data.pagination.total / data.pagination.pageSize)
						? '#'
						: `/author/articles?${new URLSearchParams({
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
