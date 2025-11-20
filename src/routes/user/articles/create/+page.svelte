<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import SupabaseImageUpload from '$lib/components/SupabaseImageUpload.svelte';
	import type { SvelteComponent } from 'svelte';

	type CreateArticleSuccess = { article?: { published?: boolean } };
	type CreateArticleFailure = { message?: string; formError?: string; field?: 'title' | 'content' };
	type UploadCompleteDetail = { url: string; filePath: string; bucket: string };
	type SupabaseImageUploadInstance = SvelteComponent & { clearSelection?: () => void };

	let uploader: SupabaseImageUploadInstance | null = null;

	let formData = $state({
		title: '',
		content: '',
		imageUrl: '',
		published: false
	});

	let errors = $state({
		title: '',
		content: '',
		imageUrl: ''
	});

	let statusMessage = $state('Start typing and decide whether to keep this as a draft.');
	let statusMessageType = $state<'info' | 'error'>('info');
	let isSaving = $state(false);

	const handleFormSubmit: SubmitFunction<CreateArticleSuccess, CreateArticleFailure> = ({
		cancel
	}) => {
		if (isSaving) {
			return;
		}

		const isValid = validateForm();
		if (!isValid) {
			statusMessage = 'Please fix the errors below before submitting.';
			statusMessageType = 'error';
			cancel();
			return;
		}

		statusMessage = 'Saving article…';
		statusMessageType = 'info';
		isSaving = true;

		return async ({ result, update }) => {
			isSaving = false;

			if (result.type === 'success') {
				const article = result.data?.article;

				statusMessage = article?.published
					? 'Article published successfully; it will appear in your feed shortly.'
					: 'Draft saved; you can publish it once you are ready.';
				statusMessageType = 'info';

				if (article) {
					// Delay reset to allow user to see success message
					setTimeout(() => {
						formData = {
							title: '',
							content: '',
							imageUrl: '',
							published: false
						};

						errors = {
							title: '',
							content: '',
							imageUrl: ''
						};
						uploader?.clearSelection?.();
					}, 2000);
				}
			} else if (result.type === 'failure') {
				const formError = result.data?.formError ?? result.data?.message;
				const field = result.data?.field;
				statusMessage = formError ?? 'Unable to save the article right now.';
				statusMessageType = 'error';
				if (field && formError) {
					errors = { ...errors, [field]: formError };
				}
			} else if (result.type === 'error') {
				statusMessage = result.error.message ?? 'Unable to save the article right now.';
				statusMessageType = 'error';
			}

			await update?.({ reset: false, invalidateAll: false });
		};
	};

	const validateForm = () => {
		let isValid = true;

		// Reset errors
		errors = {
			title: '',
			content: '',
			imageUrl: ''
		};

		// Validate title
		if (!formData.title.trim()) {
			errors.title = 'Title is required';
			isValid = false;
		} else if (formData.title.length < 5) {
			errors.title = 'Title must be at least 5 characters';
			isValid = false;
		} else if (formData.title.length > 100) {
			errors.title = 'Title must be less than 100 characters';
			isValid = false;
		}

		// Validate content
		if (!formData.content.trim()) {
			errors.content = 'Content is required';
			isValid = false;
		} else if (formData.content.length < 20) {
			errors.content = 'Content must be at least 20 characters';
			isValid = false;
		}

		// Image URL is optional, so no validation needed

		return isValid;
	};

	const togglePublished = (value: boolean) => {
		formData.published = value;
		statusMessage = value ? 'Ready to publish once you save.' : 'Draft saved locally.';
	};

	function handleUploadComplete(detail: UploadCompleteDetail) {
		formData.imageUrl = detail.url;
		statusMessage = 'Image ready for the article; save to persist.';
	}

	function handleCleared() {
		formData.imageUrl = '';
		statusMessage = 'Upload cleared; pick a new image when ready.';
	}
</script>

<svelte:head>
	<title>Create article | Author workspace</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-10">
	<div class="mx-auto max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
		<header class="space-y-2">
			<p class="text-xs font-semibold tracking-wide text-blue-600 uppercase">Author workspace</p>
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="text-3xl font-bold text-gray-900">Create a new article</h1>
			</div>
		</header>

		<div class="grid gap-10 lg:grid-cols-[3fr_2fr]">
			<form
				class="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
				method="POST"
				use:enhance={handleFormSubmit}
			>
				<div>
					<label for="title" class="text-xs font-semibold tracking-wide text-gray-500 uppercase"
						>Title</label
					>
					<input
						id="title"
						type="text"
						class="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="How we scaled Prisma migrations with SvelteKit"
						name="title"
						bind:value={formData.title}
					/>
					{#if errors.title}
						<p class="mt-1 text-sm text-red-600">{errors.title}</p>
					{/if}
				</div>

				<div>
					<label for="content" class="text-xs font-semibold tracking-wide text-gray-500 uppercase"
						>Body content</label
					>
					<textarea
						id="content"
						rows="10"
						class="mt-2 w-full rounded-xl border border-gray-300 px-3 py-3 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="Write the article body that becomes the `content` string for Prisma."
						name="content"
						bind:value={formData.content}
					></textarea>
					{#if errors.content}
						<p class="mt-1 text-sm text-red-600">{errors.content}</p>
					{/if}
				</div>

				<SupabaseImageUpload
					bind:this={uploader}
					bucket="uploads"
					autoUpload={false}
					bind:url={formData.imageUrl}
					onuploadcomplete={handleUploadComplete}
					oncleared={handleCleared}
				/>
				<input type="hidden" name="imageUrl" bind:value={formData.imageUrl} />
				<input type="hidden" name="published" value={formData.published ? '1' : '0'} />

				<div
					class="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600"
				>
					<span class="text-xs font-semibold tracking-wide text-gray-500 uppercase"
						>Publishing state</span
					>
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition ${
							formData.published
								? 'bg-blue-600 text-white'
								: 'border border-gray-300 bg-white text-gray-600'
						}`}
						onclick={() => togglePublished(true)}
					>
						Publish after save
					</button>
					<button
						type="button"
						class={`rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition ${
							!formData.published
								? 'bg-gray-900 text-white'
								: 'border border-gray-300 bg-white text-gray-600'
						}`}
						onclick={() => togglePublished(false)}
					>
						Keep draft
					</button>
				</div>

				<div class="flex flex-wrap items-center justify-between gap-4">
					<span class="text-xs text-gray-500">{statusMessage}</span>
					<button
						type="submit"
						class="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
						disabled={isSaving}
					>
						<span>{isSaving ? 'Saving…' : 'Save article'}</span>
					</button>
				</div>
			</form>

			<aside class="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<div>
					<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Live preview</p>
				</div>

				<div
					class="space-y-2 rounded-xl border border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4 text-sm text-gray-600"
				>
					<p class="text-xs tracking-wide text-gray-400 uppercase">
						Status: {formData.published ? 'Published' : 'Draft'}
					</p>
					<p class="text-lg font-semibold text-gray-900">{formData.title || 'Insert a headline'}</p>
					<p class="text-sm text-gray-500">
						{formData.content ? formData.content.slice(0, 120) + '…' : 'Body preview appears here.'}
					</p>
					{#if formData.imageUrl}
						<div class="flex flex-col items-center gap-2">
							<img
								src={formData.imageUrl}
								alt="Preview"
								class="max-h-[200px] max-w-[200px] object-contain"
							/>
						</div>
					{:else}
						<p class="text-xs text-gray-400">No image URL yet.</p>
					{/if}
				</div>
			</aside>
		</div>
	</div>
</div>
