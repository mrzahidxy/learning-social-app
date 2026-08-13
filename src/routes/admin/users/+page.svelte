<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { goto } from '$app/navigation';
	import type { Role } from '@prisma/client';

	type AdminUser = { userId: string; role: Role; displayName?: string | null };

	let { data } = $props<{
		data: {
			users: AdminUser[];
			search: string;
			pagination: { page: number; pageSize: number; total: number };
		};
	}>();
	const roles = ['READER', 'AUTHOR', 'ADMIN'] as const;

	let users = $state([] as AdminUser[]);
	const pending = $state(new Set<string>());
	const errorMap = $state(new Map<string, string>());

	$effect(() => {
		users = structuredClone(data.users);
	});

	const buildUsersHref = (page?: number, q = data.search) => {
		const params = new URLSearchParams();
		const trimmed = q.trim();

		if (trimmed) params.set('q', trimmed);
		if (page && page > 1) params.set('page', String(page));

		return `/admin/users${params.size ? `?${params}` : ''}`;
	};

	function onSearch(event: SubmitEvent) {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const q = ((new FormData(form).get('q') as string) ?? '').trim();
		goto(buildUsersHref(undefined, q));
	}

	async function updateRole(userId: string, nextRole: Role) {
		pending.add(userId);
		errorMap.delete(userId);

		const original = users.find((user) => user.userId === userId);
		if (!original) return;

		const previousRole = original.role;
		original.role = nextRole;

		try {
			const res = await fetch(`/api/admin/users/${userId}/role`, {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ role: nextRole })
			});

			if (!res.ok) throw new Error(await res.text());
			await invalidateAll();
		} catch (err) {
			original.role = previousRole;
			errorMap.set(userId, err instanceof Error ? err.message : 'Failed to update role');
		} finally {
			pending.delete(userId);
		}
	}
</script>

<section class="mx-auto max-w-5xl space-y-6 px-4 py-8">
	<header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-semibold">User Management</h1>
			<p class="text-sm text-gray-600">Search users and change their access level.</p>
		</div>
		<form class="flex gap-2" onsubmit={onSearch}>
			<input
				class="w-48 rounded border border-gray-300 px-3 py-2 text-sm"
				name="q"
				placeholder="Search by name or ID"
				value={data.search}
			/>
			<button class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white">Search</button>
		</form>
	</header>

	<table
		class="w-full table-auto border-collapse rounded-xl border border-gray-200 bg-white shadow-sm"
	>
		<thead class="bg-gray-50 text-left text-sm text-gray-600">
			<tr>
				<th class="px-4 py-3 font-medium">User</th>
				<th class="px-4 py-3 font-medium">Role</th>
				<th class="px-4 py-3 text-right font-medium">Actions</th>
			</tr>
		</thead>
		<tbody>
			{#if users.length === 0}
				<tr>
					<td class="px-4 py-6 text-center text-sm text-gray-500" colspan="3">No users found.</td>
				</tr>
			{:else}
				{#each users as user (user.userId)}
					<tr class="border-t text-sm">
						<td class="px-4 py-3">
							<div class="font-medium">{user.displayName ?? '—'}</div>
							<div class="text-xs text-gray-500">{user.userId}</div>
						</td>
						<td class="px-4 py-3">
							<select
								class="rounded border border-gray-300 px-2 py-1 text-sm"
								bind:value={user.role}
								onchange={(event) =>
									updateRole(user.userId, (event.target as HTMLSelectElement).value as Role)}
								disabled={pending.has(user.userId)}
							>
								{#each roles as role (role)}
									<option value={role}>{role}</option>
								{/each}
							</select>
						</td>
						<td class="px-4 py-3 text-right">
							{#if pending.has(user.userId)}
								<span class="text-xs text-gray-500">Saving…</span>
							{:else if errorMap.has(user.userId)}
								<span class="text-xs text-red-600">{errorMap.get(user.userId)}</span>
							{/if}
						</td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>

	{#if data.pagination.total > data.pagination.pageSize}
		{@const totalPages = Math.ceil(data.pagination.total / data.pagination.pageSize)}
		<footer class="flex items-center justify-between text-sm text-gray-600">
			<span>Page {data.pagination.page} of {totalPages}</span>
			<div class="space-x-2">
				<a
					class="rounded border px-3 py-1"
					aria-disabled={data.pagination.page <= 1}
					href={data.pagination.page <= 1 ? '#' : buildUsersHref(data.pagination.page - 1)}
				>
					Previous
				</a>
				<a
					class="rounded border px-3 py-1"
					aria-disabled={data.pagination.page >= totalPages}
					href={data.pagination.page >= totalPages ? '#' : buildUsersHref(data.pagination.page + 1)}
				>
					Next
				</a>
			</div>
		</footer>
	{/if}
</section>
