<script lang="ts">
	interface Props {
		message: string;
	}

	let { message }: Props = $props();
</script>

<!-- Error message component for displaying form validation and API errors -->
<div class="rounded-lg border border-red-200 bg-red-50 p-4" role="alert" aria-live="assertive">
	<div class="flex items-center">
		<svg
			class="mr-3 h-5 w-5 flex-shrink-0 text-red-600"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
			/>
		</svg>
		<p class="text-sm font-medium text-red-800">
			{message}
		</p>
	</div>
</div>
