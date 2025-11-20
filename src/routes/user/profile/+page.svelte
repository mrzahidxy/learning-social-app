<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SupabaseImageUpload from '$lib/components/SupabaseImageUpload.svelte';
	import type { SvelteComponent } from 'svelte';

	const props = $props();
	const data = $derived(props.data);

	let displayName = $state('');
	let bio = $state('');
	let profileImageUrl = $state('');
	let desiredRole = $state<'AUTHOR' | 'READER'>('AUTHOR');
	let statusMessage = $state('Update your profile and request author access.');
	let statusType = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let isSubmitting = $state(false);
	let mode = $state<'view' | 'edit'>('view');

	let uploader: (SvelteComponent & { clearSelection?: () => void }) | null = null;

	const canSubmit = $derived(displayName.trim().length > 0 && !isSubmitting);

	const handleUploadComplete = (detail: { url: string }) => {
		profileImageUrl = detail.url;
		statusMessage = 'Profile image uploaded';
		statusType = 'idle';
	};

	const handleCleared = () => {
		profileImageUrl = '';
		statusMessage = 'Profile image cleared';
		statusType = 'idle';
	};

	$effect(() => {
		mode = ($page.url.searchParams.get('mode') as 'view' | 'edit') || 'view';
	});

	$effect(() => {
		const profile = data?.profile;
		if (profile) {
			displayName = profile.displayName ?? '';
			bio = profile.bio ?? '';
			profileImageUrl = profile.profileImage ?? '';
			desiredRole = (profile.role as typeof desiredRole) ?? 'READER';
		}
	});

type UpdateProfileSuccess = {
	profile?: { displayName?: string | null; bio?: string | null; role?: string; profileImage?: string | null };
};
type UpdateProfileFailure = { formError?: string; field?: string };

	const handleFormSubmit: SubmitFunction<UpdateProfileSuccess, UpdateProfileFailure> = ({ cancel }) => {
		if (!displayName.trim()) {
			statusType = 'error';
			statusMessage = 'Display name is required.';
			cancel();
			return;
		}

		if (isSubmitting) {
			cancel();
			return;
		}

		isSubmitting = true;
		statusType = 'sending';
		statusMessage = 'Sending your request...';

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				statusType = 'success';
				statusMessage = 'Profile saved. We will review your request.';

				if (result.data?.profile) {
					displayName = result.data.profile.displayName ?? displayName;
					bio = result.data.profile.bio ?? bio;
					desiredRole = (result.data.profile.role as typeof desiredRole) ?? desiredRole;
					profileImageUrl = result.data.profile.profileImage ?? profileImageUrl;
				}

				uploader?.clearSelection?.();
			} else if (result.type === 'failure') {
				statusType = 'error';
				statusMessage = result.data?.formError ?? 'Unable to save profile right now.';
				if (result.data?.field === 'displayName') {
					// focus could be added if desired
				}
			} else if (result.type === 'error') {
				statusType = 'error';
				statusMessage = result.error.message ?? 'Unable to save profile right now.';
			}

			await update?.({ reset: false, invalidateAll: false });
		};
	};
</script>

<svelte:head>
	<title>My Profile | Author Request</title>
</svelte:head>

<section class="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">

	<header class="space-y-2">
		<p class="text-xs font-semibold uppercase tracking-wide text-blue-600">Author workspace</p>
		<h1 class="text-3xl font-bold text-gray-900">My profile</h1>
		<p class="text-sm text-gray-600">Share a short bio and request author permissions.</p>
	</header>

	{#if mode === 'edit'}
		<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<form
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
				method="POST"
				use:enhance={handleFormSubmit}
			>
				<div class="space-y-6">
					<div>
						<label class="text-xs font-semibold uppercase tracking-wide text-gray-500" for="displayName">
							Display name
						</label>
						<input
							id="displayName"
							type="text"
							name="displayName"
							class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							placeholder="Your public name"
							bind:value={displayName}
						/>
					</div>

					<div>
						<label class="text-xs font-semibold uppercase tracking-wide text-gray-500" for="bio">
							Bio (optional)
						</label>
						<textarea
							id="bio"
							rows="5"
							name="bio"
							class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
							placeholder="Tell readers a little about yourself."
							bind:value={bio}
						></textarea>
					</div>

					<div>
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Requested role</p>
						<div class="mt-2 inline-flex overflow-hidden rounded-full border border-gray-300 bg-gray-50">
							<button
								type="button"
								class={`px-4 py-2 text-sm font-semibold transition ${
									desiredRole === 'AUTHOR'
										? 'bg-blue-600 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								aria-pressed={desiredRole === 'AUTHOR'}
								onclick={() => (desiredRole = 'AUTHOR')}
							>
								Author
							</button>
							<button
								type="button"
								class={`px-4 py-2 text-sm font-semibold transition ${
									desiredRole === 'READER'
										? 'bg-blue-600 text-white'
										: 'text-gray-700 hover:bg-gray-100'
								}`}
								aria-pressed={desiredRole === 'READER'}
								onclick={() => (desiredRole = 'READER')}
							>
								Reader
							</button>
						</div>
						<input type="hidden" name="requestedRole" value={desiredRole} />
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
				</div>

				<div class="mt-6 flex flex-wrap items-center justify-between gap-4">
					<p
						class={`text-sm ${
							statusType === 'success'
								? 'text-green-600'
								: statusType === 'error'
									? 'text-red-600'
									: 'text-gray-600'
						}`}
						aria-live="polite"
					>
						{statusMessage}
					</p>

					<button
						type="submit"
						class="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
						disabled={!canSubmit}
					>
						{statusType === 'sending' ? 'Requesting…' : 'Request author role'}
					</button>
				</div>
			</form>

			<aside class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-4">
					<div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
						{#if profileImageUrl}
							<img src={profileImageUrl} alt="Profile preview" class="h-full w-full object-cover" />
						{:else}
							<span class="text-xs text-gray-400">No image</span>
						{/if}
					</div>
					<div>
						<p class="text-sm font-semibold text-gray-900">{displayName || 'Your display name'}</p>
						<p class="text-xs text-gray-500">
							Requested role:
							<span
								class={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
									desiredRole === 'AUTHOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
								}`}
							>
								{desiredRole === 'AUTHOR' ? 'Author' : 'Reader'}
							</span>
						</p>
					</div>
				</div>
				<div class="space-y-2">
					<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Bio preview</p>
					<p class="text-sm text-gray-700 whitespace-pre-wrap">
						{bio || 'Write a short bio to introduce yourself.'}
					</p>
				</div>
			</aside>
		</div>
	{:else}
		<div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
			<div class="flex items-center gap-4">
				<div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
					{#if profileImageUrl}
						<img src={profileImageUrl} alt="Profile" class="h-full w-full object-cover" />
					{:else}
						<span class="text-xs text-gray-400">No image</span>
					{/if}
				</div>
				<div>
					<p class="text-lg font-semibold text-gray-900">{displayName || 'Your display name'}</p>
					<p class="text-xs text-gray-500">
						Role:
						<span
							class={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
								desiredRole === 'AUTHOR' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
							}`}
						>
							{desiredRole === 'AUTHOR' ? 'Author' : 'Reader'}
						</span>
					</p>
				</div>
			</div>
			<div class="mt-4 space-y-2">
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Bio</p>
				<p class="text-sm text-gray-700 whitespace-pre-wrap">
					{bio || 'Write a short bio to introduce yourself.'}
				</p>
			</div>

			<div class="flex justify-end">
				<button
					type="button"
					class="inline-flex cursor-pointer items-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
					onclick={() => goto('?mode=edit', { replaceState: true, noScroll: true })}
				>
					Edit profile
				</button>
			</div>
		</div>
	{/if}
</section>
