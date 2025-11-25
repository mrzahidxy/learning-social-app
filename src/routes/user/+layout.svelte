<script lang="ts">
	import AuthorSidebar from '$lib/features/user/components/AuthorSidebar.svelte';

	const props = $props();

	const children = $derived(props.children);
	const data = $derived(props.data);
	const role = $derived(data?.role ?? 'READER');
	const isAuthor = $derived(role === 'AUTHOR');
	const roleLabel = $derived(role === 'AUTHOR' ? 'Author' : 'Reader');

	$inspect(isAuthor);
</script>

<div class="min-h-screen bg-gray-50">
	<div class="flex min-h-screen flex-col md:flex-row">
		<aside
			class="w-full border-b border-gray-200 bg-white md:w-72 md:flex-shrink-0 md:border-r md:border-b-0"
		>
			<AuthorSidebar isAuthor={isAuthor} roleLabel={roleLabel} />
		</aside>
		<main class="flex-1">
			{@render children?.()}
		</main>
	</div>
</div>
