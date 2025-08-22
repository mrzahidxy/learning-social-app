<script lang="ts">
	interface Props {
		email: string;
		onBack: () => void;
	}

	let { email, onBack }: Props = $props();
</script>

<!-- Success state component displayed after successful magic link submission -->
<div class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
	<!-- Success Icon -->
	<div class="text-center mb-6">
		<div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
			<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
			</svg>
		</div>
		<h2 class="text-2xl font-bold text-gray-900 mb-2">
			Check your email
		</h2>
		<p class="text-gray-600 text-sm leading-relaxed">
			We've sent a magic link to <span class="font-medium text-gray-900">{email}</span>
		</p>
	</div>

	<!-- Instructions -->
	<div class="bg-blue-50 rounded-lg p-4 mb-6">
		<div class="flex items-start">
			<svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div class="text-sm">
				<p class="text-blue-800 font-medium mb-1">Next steps:</p>
				<ol class="text-blue-700 list-decimal list-inside space-y-1">
					<li>Open your email inbox</li>
					<li>Look for our message (check spam if needed)</li>
					<li>Click the magic link to sign in instantly</li>
				</ol>
			</div>
		</div>
	</div>

	<!-- Action Buttons -->
	<div class="space-y-3">
		<button
			type="button"
			class="w-full py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 
			       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
			       transition-colors duration-200"
			onclick={() => window.open('mailto:', '_blank')}
		>
			<svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
			</svg>
			Open email app
		</button>
		
		<button
			type="button"
			onclick={onBack}
			class="w-full py-3 px-4 text-sm font-medium text-blue-600 hover:text-blue-500 
			       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
			       transition-colors duration-200"
		>
			← Send to a different email
		</button>
	</div>

	<!-- Help Text -->
	<div class="mt-6 pt-6 border-t border-gray-200 text-center">
		<p class="text-xs text-gray-500">
			Didn't receive the email? Check your spam folder or 
			<button 
				type="button"
				onclick={onBack}
				class="text-blue-600 hover:text-blue-500 font-medium focus:outline-none focus:underline"
			>
				try again
			</button>
		</p>
	</div>
</div>