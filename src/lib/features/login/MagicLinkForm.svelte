<script lang="ts">
	import { onMount } from 'svelte';
	import LoadingSpinner from '../../components/LoadingSpinner.svelte';
	import SuccessMessage from './SuccessMessage.svelte';
	import ErrorMessage from '../../components/ErrorMessage.svelte';
	import { validateField } from '$lib/utils/validate';
	import { createClient } from '@supabase/supabase-js';
	import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';

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
	 * Simulates magic link API request
	 * In production, replace with actual API call
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

<div class="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
	<div class="w-full max-w-md">
		<!-- Header Section -->
		<div class="animate-fade-in mb-8 text-center">
			<div
				class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
			>
				<svg
					class="h-8 w-8 text-white"
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
			<h1 class="mb-3 text-3xl font-bold text-gray-900">Welcome back</h1>
			<p class="text-base leading-relaxed text-gray-600">
				Enter your email address and we'll send you a secure magic link to sign in instantly. No
				passwords required.
			</p>
		</div>

		<!-- Success State -->
		{#if showSuccess}
			<div class="animate-slide-up">
				<SuccessMessage {email} onBack={resetForm} />
			</div>
		{:else}
			<!-- Main Form Card -->
			<div class="animate-fade-in rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
				<form
					bind:this={formElement}
					onsubmit={handleSubmit}
					novalidate
					class="space-y-6"
					role="form"
					aria-label="Magic link login form"
				>
					<!-- General Error Message -->
					{#if errors.general}
						<div class="animate-slide-up">
							<ErrorMessage message={errors.general} />
						</div>
					{/if}

					<!-- Email Input Field -->
					<div class="space-y-2">
						<label for="email" class="block text-sm font-medium text-gray-700">
							Email address
						</label>
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
								class="block w-full rounded-lg border border-gray-300 px-4 py-3 text-base placeholder-gray-400
								       shadow-sm transition-colors duration-200 focus:border-transparent
								       focus:ring-2 focus:ring-blue-500 focus:outline-none
								       disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
								class:border-red-300={errors.email}
								class:focus:ring-red-500={errors.email}
								aria-describedby={errors.email ? 'email-error' : 'email-description'}
								aria-invalid={errors.email ? 'true' : 'false'}
							/>
							<!-- Email Icon -->
							<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
								<svg
									class="h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
									/>
								</svg>
							</div>
						</div>
						<!-- Email Validation Error -->
						{#if errors.email}
							<p
								id="email-error"
								class="animate-slide-up text-sm text-red-600"
								role="alert"
								aria-live="polite"
							>
								{errors.email}
							</p>
						{:else}
							<p id="email-description" class="text-sm text-gray-500">
								We'll never share your email with anyone else.
							</p>
						{/if}
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={isLoading}
						class="flex w-full transform items-center justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-base font-medium
						       text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:bg-blue-700
						       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
						       focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600"
						aria-describedby="submit-description"
					>
						{#if isLoading}
							<LoadingSpinner />
							<span class="ml-2">Sending magic link...</span>
						{:else}
							<svg
								class="mr-2 h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/>
							</svg>
							Send magic link
						{/if}
					</button>
					<p id="submit-description" class="text-center text-xs text-gray-500">
						Click to receive a secure login link via email
					</p>
				</form>
			</div>
		{/if}
	</div>
</div>
