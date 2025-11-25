<script lang="ts">
	interface Props {
		email: string;
		onBack: () => void;
	}

	let { email, onBack }: Props = $props();
</script>

<!-- Success state content displayed after successful magic link submission -->
<div class="space-y-5">
	<div class="space-y-3 text-center">
		<div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h2 class="text-lg font-semibold text-gray-900">Check your email</h2>
		<p class="text-sm text-gray-600">
			We've sent a magic link to <span class="font-medium text-gray-900">{email}</span>
		</p>
	</div>

	<div class="rounded-lg bg-blue-50 p-3 text-left text-sm text-blue-800">
		<p class="font-medium">Next steps</p>
		<ol class="mt-2 space-y-1 list-decimal list-inside">
			<li>Open your email inbox</li>
			<li>Find our message (check spam if needed)</li>
			<li>Tap the link to finish signing in</li>
		</ol>
	</div>

	<div class="space-y-2.5">
		<button
			type="button"
			class="flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
			onclick={() => window.open('mailto:', '_blank')}
		>
			<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
			</svg>
			Open email app
		</button>

		<button
			type="button"
			onclick={onBack}
			class="w-full text-sm font-medium text-blue-600 transition-colors duration-200 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		>
			← Send to a different email
		</button>
	</div>

	<p class="border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
		Not seeing the email? Check spam or
		<button
			type="button"
			onclick={onBack}
			class="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
		>
			try again
		</button>
		.
	</p>
</div>
