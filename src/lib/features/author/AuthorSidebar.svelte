<script lang="ts">
	import { page } from '$app/state';

	type AdminNavItem = {
		label: string;
		href: string;
		description?: string;
	};
	const currentPath = $derived(page.url.pathname);

	const navItems = [
		{ label: 'Articles', href: '/author/articles', description: 'Manage content visibility' },
		{ label: 'Profile', href: '/author/profile', description: 'Review and update user access' }
	] satisfies AdminNavItem[];

	function isActive(href: string) {
		const path = currentPath;
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<nav class="flex flex-col gap-2 p-4 text-sm text-gray-700" aria-label="Admin navigation">
	<header class="mb-4">
		<h2 class="text-lg font-semibold text-gray-900">Author Panel</h2>
		<p class="text-xs text-gray-500">Manage your community content and members.</p>
	</header>
	{#each navItems as item (item.href)}
		<a
			class={`group rounded-lg border px-3 py-2 transition ${
				isActive(item.href)
					? 'border-blue-500 bg-blue-50 text-blue-700'
					: 'border-transparent text-gray-700 hover:border-blue-200 hover:bg-blue-50'
			}`}
			href={item.href}
			aria-current={isActive(item.href) ? 'page' : undefined}
		>
			<div class="flex items-center justify-between">
				<span class="font-medium">{item.label}</span>
				<span
					class={`h-2 w-2 rounded-full ${
						isActive(item.href) ? 'bg-blue-500' : 'bg-transparent group-hover:bg-blue-200'
					}`}
					aria-hidden="true"
				></span>
			</div>
			{#if item.description}
				<p class="mt-1 text-xs text-gray-500 group-hover:text-blue-600">{item.description}</p>
			{/if}
		</a>
	{/each}
</nav>
