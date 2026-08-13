<script lang="ts">
	/* eslint-disable svelte/prefer-writable-derived */
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SupabaseImageUpload from '$lib/features/user/components/SupabaseImageUpload.svelte';
	import type { SvelteComponent } from 'svelte';

	type ProfileFormData = {
		displayName?: string | null;
		bio?: string | null;
		role?: string;
		profileImage?: string | null;
	};

	type UploaderInstance = SvelteComponent & { clearSelection?: () => void };

	let { data } = $props();

	let displayName = $state('');
	let bio = $state('');
	let profileImageUrl = $state('');
	let savedProfileImageUrl = $state('');
	let clearProfileImage = $state(false);
	let desiredRole = $state<'AUTHOR' | 'READER'>('AUTHOR');
	let statusMessage = $state('Update your profile and request author access.');
	let statusType = $state<'idle' | 'sending' | 'success' | 'error'>('idle');
	let isSubmitting = $state(false);

	const mode = $derived(($page.url.searchParams.get('mode') as 'view' | 'edit') || 'view');

	let uploader = $state<UploaderInstance | null>(null);

	const canSubmit = $derived(displayName.trim().length > 0 && !isSubmitting);
	const submitLabel = $derived(statusType === 'sending' ? 'Requesting…' : 'Request author role');

	const applyProfile = (profile: ProfileFormData | null | undefined) => {
		displayName = profile?.displayName ?? '';
		bio = profile?.bio ?? '';
		savedProfileImageUrl = profile?.profileImage ?? '';
		profileImageUrl = savedProfileImageUrl;
		clearProfileImage = false;
		desiredRole = profile?.role === 'AUTHOR' ? 'AUTHOR' : 'READER';
	};

	const handleImageSelected = (detail: { previewUrl: string }) => {
		profileImageUrl = detail.previewUrl;
		clearProfileImage = false;
		statusMessage = 'Profile image selected';
		statusType = 'idle';
	};

	const handleCleared = () => {
		clearProfileImage = Boolean(savedProfileImageUrl);
		profileImageUrl = '';
		statusMessage = clearProfileImage
			? 'Profile image will be removed on save'
			: 'Profile image cleared';
		statusType = 'idle';
	};

	$effect(() => {
		applyProfile(data?.profile);
	});

	type UpdateProfileSuccess = {
		profile?: ProfileFormData;
	};
	type UpdateProfileFailure = { formError?: string; field?: string };

	const handleFormSubmit: SubmitFunction<UpdateProfileSuccess, UpdateProfileFailure> = ({
		cancel
	}) => {
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

				uploader?.clearSelection?.();
				applyProfile(result.data?.profile);
			} else if (result.type === 'failure') {
				statusType = 'error';
				statusMessage = result.data?.formError ?? 'Unable to save profile right now.';
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
		<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Author workspace</p>
		<h1 class="text-3xl font-bold text-gray-900">My profile</h1>
		<p class="text-sm text-gray-600">Share a short bio and request author permissions.</p>
	</header>

	{#if mode === 'edit'}
		<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<form
				class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
				method="POST"
				enctype="multipart/form-data"
				use:enhance={handleFormSubmit}
			>
				<div class="space-y-6">
					<div>
						<label
							class="text-xs font-semibold tracking-wide text-gray-500 uppercase"
							for="displayName"
						>
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
						<label class="text-xs font-semibold tracking-wide text-gray-500 uppercase" for="bio">
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
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
							Requested role
						</p>
						<div
							class="mt-2 inline-flex overflow-hidden rounded-full border border-gray-300 bg-gray-50"
						>
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
						<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Profile image</p>
						<SupabaseImageUpload
							bind:this={uploader}
							name="profileImage"
							bind:url={profileImageUrl}
							allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
							maxSize={2 * 1024 * 1024}
							onselected={handleImageSelected}
							oncleared={handleCleared}
						/>
						<input type="hidden" name="clearProfileImage" value={clearProfileImage ? '1' : '0'} />
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
						{submitLabel}
					</button>
				</div>
			</form>

			<aside class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<div class="flex items-center gap-4">
					<div
						class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100"
					>
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
									desiredRole === 'AUTHOR'
										? 'bg-blue-100 text-blue-700'
										: 'bg-gray-200 text-gray-700'
								}`}
							>
								{desiredRole === 'AUTHOR' ? 'Author' : 'Reader'}
							</span>
						</p>
					</div>
				</div>
				<div class="space-y-2">
					<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Bio preview</p>
					<p class="text-sm whitespace-pre-wrap text-gray-700">
						{bio || 'Write a short bio to introduce yourself.'}
					</p>
				</div>
			</aside>
		</div>
	{:else}
		<div class="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100"
				>
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
				<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Bio</p>
				<p class="text-sm whitespace-pre-wrap text-gray-700">
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
