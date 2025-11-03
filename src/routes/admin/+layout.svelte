<script lang="ts">
	import AdminSidebar from '$lib/components/admin/AdminSidebar.svelte';

	const props = $props();

	const children = $derived(props.children);
</script>

<div class="min-h-screen bg-gray-50">
	<div class="flex min-h-screen flex-col md:flex-row">
		<aside
			class="w-full border-b border-gray-200 bg-white md:w-72 md:flex-shrink-0 md:border-r md:border-b-0"
		>
			<AdminSidebar />
		</aside>
		<main class="flex-1">
			{@render children?.()}
		</main>
	</div>
</div>
