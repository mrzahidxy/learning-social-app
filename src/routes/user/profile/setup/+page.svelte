<script lang="ts">
	import SupabaseImageUpload from '$lib/features/user/components/SupabaseImageUpload.svelte';
	import type { SvelteComponent } from 'svelte';

	type ProfileData = {
		profile: {
			displayName?: string | null;
			bio?: string | null;
			profileImage?: string | null;
		};
		form?: {
			formError?: string;
			field?: string;
			values?: {
				displayName: string;
				bio: string;
				profileImageUrl: string;
			};
		};
	};

	const props = $props<{ data: ProfileData; form: ProfileData['form'] }>();
	const data = $derived(props.data);
	const form = $derived(props.form);

	let displayName = $state('');
	let bio = $state('');
	let profileImageUrl = $state('');
	let uploader = $state<(SvelteComponent & { clearSelection?: () => void }) | null>(null);

	$effect(() => {
		const values = form?.values;
		displayName = values?.displayName ?? data.profile.displayName ?? '';
		bio = values?.bio ?? data.profile.bio ?? '';
		profileImageUrl = values?.profileImageUrl ?? data.profile.profileImage ?? '';
	});

	const handleUploadComplete = (detail: { url: string }) => {
		profileImageUrl = detail.url;
	};

	const handleCleared = () => {
		profileImageUrl = '';
		uploader?.clearSelection?.();
	};
</script>

<svelte:head>
	<title>Complete your profile | Pathshala</title>
</svelte:head>

<section class="mx-auto flex min-h-[calc(100vh-6rem)] max-w-3xl items-center px-4 py-10 sm:px-6">
	<div class="w-full rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
		<div class="space-y-2">
			<p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">First-time setup</p>
			<h1 class="text-3xl font-semibold text-gray-900">Complete your profile</h1>
			<p class="text-sm text-gray-600">
				Add a display name before you continue. Your account starts as a `READER`.
			</p>
		</div>

		<form method="POST" class="mt-8 space-y-6">
			<div>
				<label for="displayName" class="text-xs font-semibold uppercase tracking-wide text-gray-500">
					Display name
				</label>
				<input
					id="displayName"
					name="displayName"
					type="text"
					bind:value={displayName}
					class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					placeholder="Your public name"
					autocomplete="nickname"
				/>
			</div>

			<div>
				<label for="bio" class="text-xs font-semibold uppercase tracking-wide text-gray-500">
					Bio
				</label>
				<textarea
					id="bio"
					name="bio"
					rows="4"
					bind:value={bio}
					class="mt-1 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					placeholder="Tell readers a little about yourself."
				></textarea>
			</div>

			<div class="space-y-2">
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Profile image</p>
				<SupabaseImageUpload
					bind:this={uploader}
					bind:url={profileImageUrl}
					autoUpload={true}
					onuploadcomplete={handleUploadComplete}
					oncleared={handleCleared}
				/>
				<input type="hidden" name="profileImageUrl" bind:value={profileImageUrl} />
			</div>

			{#if form?.formError}
				<p class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{form.formError}
				</p>
			{/if}

			<div class="flex items-center justify-between gap-4">
				<p class="text-xs text-gray-500">Protected fields like role and user ID cannot be changed here.</p>
				<button
					type="submit"
					class="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
				>
					Save and continue
				</button>
			</div>
		</form>
	</div>
</section>
