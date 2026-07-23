<script lang="ts">
	import { enhance } from '$app/forms';
	import SupabaseImageUpload from '$lib/features/user/components/SupabaseImageUpload.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { SvelteComponent } from 'svelte';

	type ProfilePayload = {
		displayName?: string | null;
		bio?: string | null;
		role?: string;
		profileImage?: string | null;
	};

	type ActionSuccess = {
		profile?: ProfilePayload;
		values?: {
			displayName: string;
			bio: string;
			profileImageUrl: string;
		};
	};

	type ActionFailure = {
		formError?: string;
		field?: 'displayName' | 'bio' | 'profileImageUrl';
		values?: {
			displayName: string;
			bio: string;
			profileImageUrl: string;
		};
	};

	const props = $props<{
		data: {
			profile: {
				displayName?: string | null;
				bio?: string | null;
				role?: string;
				profileImage?: string | null;
			};
		};
		form?: ActionFailure;
	}>();

	const data = $derived(props.data);
	const form = $derived(props.form);

	let displayName = $state('');
	let bio = $state('');
	let profileImageUrl = $state('');
	let statusMessage = $state('Update the fields you want to show publicly.');
	let statusTone = $state<'idle' | 'success' | 'error'>('idle');
	let isSubmitting = $state(false);
	let uploader = $state<(SvelteComponent & { clearSelection?: () => void }) | null>(null);

	$effect(() => {
		const values = form?.values;
		displayName = values?.displayName ?? data.profile.displayName ?? '';
		bio = values?.bio ?? data.profile.bio ?? '';
		profileImageUrl = values?.profileImageUrl ?? data.profile.profileImage ?? '';
	});

	const roleLabel = $derived(data.profile.role ?? 'READER');

	const handleUploadComplete = (detail: { url: string }) => {
		profileImageUrl = detail.url;
		statusMessage = 'Profile image uploaded. Save to persist it.';
		statusTone = 'idle';
	};

	const handleCleared = () => {
		profileImageUrl = '';
		uploader?.clearSelection?.();
		statusMessage = 'Profile image cleared.';
		statusTone = 'idle';
	};

	const handleSubmit: SubmitFunction<ActionSuccess, ActionFailure> = ({ cancel }) => {
		if (!displayName.trim()) {
			statusMessage = 'Display name is required.';
			statusTone = 'error';
			cancel();
			return;
		}

		isSubmitting = true;
		statusMessage = 'Saving profile...';
		statusTone = 'idle';

		return async ({ result, update }) => {
			isSubmitting = false;

			if (result.type === 'success') {
				statusMessage = 'Profile saved.';
				statusTone = 'success';
			} else if (result.type === 'failure') {
				statusMessage = result.data?.formError ?? 'Unable to save your profile.';
				statusTone = 'error';
			} else if (result.type === 'error') {
				statusMessage = result.error.message ?? 'Unable to save your profile.';
				statusTone = 'error';
			}

			await update?.({ reset: false, invalidateAll: true });
		};
	};
</script>

<svelte:head>
	<title>My profile | Pathshala</title>
</svelte:head>

<section class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
	<header class="space-y-2">
		<p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Account</p>
		<h1 class="text-3xl font-semibold text-gray-900">My profile</h1>
		<p class="text-sm text-gray-600">Edit your public reader profile. Role changes are managed separately.</p>
	</header>

	<div class="grid gap-6 lg:grid-cols-[3fr_2fr]">
		<form
			method="POST"
			use:enhance={handleSubmit}
			class="space-y-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
		>
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
				/>
			</div>

			<div>
				<label for="bio" class="text-xs font-semibold uppercase tracking-wide text-gray-500">
					Bio
				</label>
				<textarea
					id="bio"
					name="bio"
					rows="6"
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

			<div class="flex items-center justify-between gap-4">
				<p
					class={`text-sm ${
						statusTone === 'success'
							? 'text-green-600'
							: statusTone === 'error'
								? 'text-red-600'
								: 'text-gray-600'
					}`}
					aria-live="polite"
				>
					{form?.formError ?? statusMessage}
				</p>
				<button
					type="submit"
					class="inline-flex items-center rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving...' : 'Save profile'}
				</button>
			</div>
		</form>

		<aside class="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-center gap-4">
				<div class="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100">
					{#if profileImageUrl}
						<img src={profileImageUrl} alt="Profile preview" class="h-full w-full object-cover" />
					{:else}
						<span class="text-xs text-gray-400">No image</span>
					{/if}
				</div>
				<div>
					<p class="text-lg font-semibold text-gray-900">{displayName || 'Your display name'}</p>
					<p class="text-xs text-gray-500">Current role</p>
					<p class="mt-1 inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
						{roleLabel}
					</p>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Bio preview</p>
				<p class="mt-2 whitespace-pre-wrap text-sm text-gray-700">
					{bio || 'Write a short bio to introduce yourself.'}
				</p>
			</div>

			<div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
				Only `displayName`, `bio`, and `profileImage` can be updated here. Protected fields stay server-controlled.
			</div>
		</aside>
	</div>
</section>
