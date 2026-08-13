<script lang="ts">
	let {
		name = 'image',
		url = $bindable(''),
		allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
		maxSize = 5 * 1024 * 1024,
		oncleared,
		onselected
	} = $props();

	let fileInput = $state<HTMLInputElement>();
	let errorMessage = $state<string | null>(null);
	let previewUrl = $state<string | null>(null);

	const activePreviewUrl = $derived(() => previewUrl ?? url ?? '');

	$effect(() => {
		return () => {
			if (previewUrl) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	});

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		errorMessage = null;

		if (!file) {
			return;
		}

		if (!allowedTypes.includes(file.type)) {
			errorMessage = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
			target.value = '';
			return;
		}

		if (file.size > maxSize) {
			errorMessage = `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`;
			target.value = '';
			return;
		}

		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}

		previewUrl = URL.createObjectURL(file);
		url = previewUrl;
		onselected?.({ file, previewUrl });
	}

	function triggerFileSelect() {
		fileInput?.click();
	}

	export function clearSelection() {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
			previewUrl = null;
		}

		if (fileInput) {
			fileInput.value = '';
		}

		errorMessage = null;
		url = '';
		oncleared?.();
	}
</script>

<div class="flex flex-col items-center gap-4 rounded-lg border-2 border-solid border-gray-300 p-8">
	<input
		type="file"
		{name}
		bind:this={fileInput}
		class="hidden"
		onchange={handleFileSelect}
		accept={allowedTypes.join(',')}
	/>

	<div class="mb-4 flex flex-wrap justify-center gap-2">
		<button
			class="cursor-pointer rounded border-0 bg-blue-500 px-4 py-2 text-white"
			onclick={triggerFileSelect}
			aria-label="Select image file"
			type="button"
		>
			Select image
		</button>

		{#if activePreviewUrl()}
			<button
				class="cursor-pointer rounded border-0 bg-red-500 px-4 py-2 text-white"
				onclick={clearSelection}
				aria-label="Clear selected image"
				type="button"
			>
				Clear
			</button>
		{/if}
	</div>

	{#if activePreviewUrl()}
		<div class="flex flex-col items-center gap-2">
			<img
				src={activePreviewUrl()}
				alt="Preview"
				class="max-h-[200px] max-w-[200px] object-contain"
			/>
		</div>
	{/if}

	{#if errorMessage}
		<div class="text-center text-sm text-red-500">
			{errorMessage}
		</div>
	{/if}
</div>
