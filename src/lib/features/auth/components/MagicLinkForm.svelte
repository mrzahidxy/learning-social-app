<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '$lib/shared/components/LoadingSpinner.svelte';
	import SuccessMessage from './SuccessMessage.svelte';
	import ErrorMessage from '$lib/shared/components/ErrorMessage.svelte';
	import { validateField } from '$lib/features/auth/utils/validate';
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
	import SendIcon from '$lib/shared/icons/SendIcon.svelte';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	// Form state management
	let email = $state('');
	let isLoading = $state(false);
	let isSubmitted = $state(false);
	let errors = $state<{ email?: string; general?: string }>({});
	let showSuccess = $state(false);
	let formElement: HTMLFormElement;

	/**
	 * Real-time email validation on input change
	 */
	function handleEmailInput() {
		if (isSubmitted) {
			const validation = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email');
			errors = { ...errors, email: validation.error };
		}
	}

	/**
	 * Sends a magic link to the provided email address
	 * @param emailAddress - Email address to send the magic link to
	 * @returns Promise resolving to an object containing a boolean indicating success and an optional message
	 */
	async function sendMagicLink(
		emailAddress: string
	): Promise<{ success: boolean; message?: string }> {
		const { error } = await supabase.auth.signInWithOtp({
			email: emailAddress,
			options: {
				emailRedirectTo: '/(auth)/confirm'
			}
		});

		if (error) {
			return { success: error.message ? false : true, message: error.message };
		}

		return { success: true };
	}

	/**
	 * Handles form submission with validation and API communication
	 * @param event - Form submit event
	 */
	async function handleSubmit(event: Event) {
		event.preventDefault();
		isSubmitted = true;
		errors = {};

		// Validate email before submission
		const emailValidation = validateField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'email');
		if (!emailValidation.isValid) {
			errors = { email: emailValidation.error };
			return;
		}

		try {
			isLoading = true;

			const response = await sendMagicLink(email);

			if (response.success) {
				showSuccess = true;
				// Reset form after successful submission
				email = '';
				isSubmitted = false;
			} else {
				errors = { general: response.message || 'Something went wrong. Please try again.' };
			}
		} catch (error) {
			console.error('Magic link request failed:', error);
			errors = { general: 'Network error. Please check your connection and try again.' };
		} finally {
			isLoading = false;
		}
	}

	/**
	 * Resets success state to allow another submission
	 */
	function resetForm() {
		showSuccess = false;
		errors = {};
		isSubmitted = false;
	}

	// Focus management for accessibility
	onMount(() => {
		const emailInput = formElement?.querySelector('input[type="email"]') as HTMLInputElement;
		emailInput?.focus();
	});
</script>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 px-4 py-6">
	<div class="w-full max-w-sm">
		{#if showSuccess}
			<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
				<SuccessMessage {email} onBack={resetForm} />
			</div>
		{:else}
			<div class="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
				<div class="mb-6 space-y-3 text-center">
					<div
						class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm"
					>
						<svg
							class="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<h1 class="text-xl font-semibold text-gray-900">Welcome back</h1>
					<p class="text-sm text-gray-600">
						Enter your email address to receive a secure magic link—no password needed.
					</p>
				</div>
				<form
					bind:this={formElement}
					onsubmit={handleSubmit}
					novalidate
					class="space-y-4"
					role="form"
					aria-label="Magic link login form"
				>
					{#if errors.general}
						<ErrorMessage message={errors.general} />
					{/if}
					<div class="space-y-1.5">
						<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
						<div class="relative">
							<input
								id="email"
								name="email"
								type="email"
								autocomplete="email"
								required
								bind:value={email}
								oninput={handleEmailInput}
								disabled={isLoading}
								placeholder="you@company.com"
								class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
								class:border-red-300={errors.email}
								class:focus:ring-red-500={errors.email}
								aria-describedby={errors.email ? 'email-error' : 'email-description'}
								aria-invalid={errors.email ? 'true' : 'false'}
							/>
						</div>
						{#if errors.email}
							<p id="email-error" class="text-xs text-red-600" role="alert" aria-live="polite">
								{errors.email}
							</p>
						{:else}
							<p id="email-description" class="text-xs text-gray-500">
								We only use your email to send the login link.
							</p>
						{/if}
					</div>
					<button
						type="submit"
						disabled={isLoading}
						class="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
						aria-describedby="submit-description"
					>
						{#if isLoading}
							<LoadingSpinner />
							<span class="ml-2">Sending magic link…</span>
						{:else}
							<SendIcon />
							Send magic link
						{/if}
					</button>
					<p id="submit-description" class="text-center text-xs text-gray-500">
						We'll email you a one-time sign-in link.
					</p>
				</form>
			</div>
		{/if}
	</div>
</div>
