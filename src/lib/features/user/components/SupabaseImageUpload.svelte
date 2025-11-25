<script lang="ts">
	import { PUBLIC_SUPABASE_URL } from '$env/static/public';

	// Props for two-way binding
	let {
		url = $bindable(null),
		filePath = $bindable(null),
		bucket = 'uploads',
		allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
		maxSize = 5 * 1024 * 1024,
		autoUpload = true,
		onuploadcomplete,
		oncleared
	} = $props();

	const resolveBucket = () => bucket || 'uploads';

	// Internal state
	let fileInput = $state<HTMLInputElement>();
	let isUploading = $state(false);
	let errorMessage = $state<string | null>(null);
	let previewUrl = $state<string | null>(null);
	let selectedFile = $state<File | null>(null);
	let uploadProgress = $state(0);

	// Cleanup effect for object URLs
	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	// Handle file selection
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			handleFileSelection(file);
		}
	}

	// Process selected file
	function handleFileSelection(file: File) {
		errorMessage = null;
		selectedFile = file;

		// Validate file type
		if (!allowedTypes.includes(file.type)) {
			errorMessage = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
			return;
		}

		// Validate file size
		if (file.size > maxSize) {
			errorMessage = `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
			return;
		}

		// Create preview
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		previewUrl = URL.createObjectURL(file);

		// Auto-upload if enabled
		if (autoUpload) {
			uploadFile(file);
		}
	}

	// Manually trigger upload (when autoUpload is false)
	async function manualUpload() {
		if (selectedFile) {
			await uploadFile(selectedFile);
		}
	}

	// Upload file to Supabase Storage with progress tracking
	async function uploadFile(file: File) {
		isUploading = true;
		errorMessage = null;
		uploadProgress = 0;

		try {
			// Get signed URL from our endpoint
			const signatureResponse = await fetch('/api/supabase/storage', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					fileName: file.name,
					contentType: file.type,
					bucket: resolveBucket()
				})
			});

			if (!signatureResponse.ok) {
				const errorData = await signatureResponse.json();
				throw new Error(errorData.message || 'Failed to get upload signature');
			}

			const { signedUrl, filePath: returnedFilePath } = await signatureResponse.json();

			// Upload file using XMLHttpRequest for progress tracking
			await uploadWithProgress(signedUrl, file);

			// Construct the public URL for the uploaded file
			const normalizedBucket = resolveBucket();
			const publicUrl = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${normalizedBucket}/${returnedFilePath}`;

			// Update the bound properties
			url = publicUrl;
			filePath = returnedFilePath;

			// Call callback for additional handling if needed
			onuploadcomplete?.({ url: publicUrl, filePath: returnedFilePath, bucket: normalizedBucket });
		} catch (err) {
			console.error('Upload error:', err);
			errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
		} finally {
			isUploading = false;
			uploadProgress = 0;
		}
	}

	// Helper function to upload with progress
	function uploadWithProgress(url: string, file: File): Promise<void> {
		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					uploadProgress = Math.round((event.loaded / event.total) * 100);
				}
			});

			xhr.addEventListener('load', () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					resolve();
				} else {
					reject(new Error(`Upload failed with status ${xhr.status}`));
				}
			});

			xhr.addEventListener('error', () => {
				reject(new Error('Upload failed'));
			});

			xhr.addEventListener('abort', () => {
				reject(new Error('Upload aborted'));
			});

			xhr.open('PUT', url);
			xhr.setRequestHeader('Content-Type', file.type);
			xhr.send(file);
		});
	}

	// Trigger file selection dialog
	function triggerFileSelect() {
		if (fileInput) {
			fileInput.click();
		}
	}

	// Clear current selection and preview
	export function clearSelection() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}

		if (fileInput) {
			fileInput.value = '';
		}

		selectedFile = null;
		errorMessage = null;

		// Clear bound properties
		url = '';
		filePath = null;

		// Call callback
		oncleared?.();
	}
</script>

<div class="flex flex-col items-center gap-4 rounded-lg border-2 border-solid border-gray-300 p-8">
	<input
		type="file"
		bind:this={fileInput}
		class="hidden"
		onchange={handleFileSelect}
		accept={allowedTypes.join(',')}
	/>

	<div class="mb-4 flex flex-wrap justify-center gap-2">
		<button
			class="cursor-pointer rounded border-0 bg-blue-500 px-4 py-2 text-white {isUploading
				? 'cursor-not-allowed bg-gray-400'
				: ''}"
			onclick={triggerFileSelect}
			disabled={isUploading}
			aria-label="Select image file"
			type="button"
		>
			{#if isUploading}
				<svg
					class="h-5 w-5 animate-spin"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" />
					<path class="opacity-75" d="M12 2a10 10 0 0 1 10 10" />
				</svg>
				<span class="sr-only">Uploading</span>
			{:else}
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M12 8v8" />
					<path d="M8 12h8" />
				</svg>
				<span class="sr-only">Select image</span>
			{/if}
		</button>

		{#if !autoUpload && selectedFile && !isUploading}
			<button
				class="cursor-pointer rounded border-0 bg-green-500 px-4 py-2 text-white"
				onclick={manualUpload}
				aria-label="Upload selected image"
				type="button"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1" />
					<path d="M12 4v12" />
					<path d="M8 9l4-5 4 5" />
				</svg>
				<span class="sr-only">Upload now</span>
			</button>
		{/if}

		{#if url || previewUrl}
			<button
				class="cursor-pointer rounded border-0 bg-red-500 px-4 py-2 text-white"
				onclick={clearSelection}
				aria-label="Clear selected image"
				type="button"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M6 6l12 12" />
					<path d="M6 18L18 6" />
				</svg>
				<span class="sr-only">Clear image</span>
			</button>
		{/if}
	</div>

	{#if isUploading}
		<div class="flex w-full max-w-[300px] items-center gap-2">
			<div class="h-2 flex-1 rounded bg-gray-200">
				<div class="h-full rounded bg-blue-500" style="width: {uploadProgress}%"></div>
			</div>
			<span class="text-sm font-medium text-gray-600">{uploadProgress}%</span>
		</div>
	{/if}

	{#if previewUrl}
		<div class="flex flex-col items-center gap-2">
			<img src={previewUrl} alt="Preview" class="max-h-[200px] max-w-[200px] object-contain" />
		</div>
	{/if}

	{#if url}
		<div class="text-center text-xs break-all text-gray-600">
			<small>Uploaded URL: {url}</small>
		</div>
	{/if}

	{#if errorMessage}
		<div class="text-center text-sm text-red-500">
			{errorMessage}
		</div>
	{/if}
</div>
