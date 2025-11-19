<script lang="ts">
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';

	type NavbarProps = {
		user?: User | null;
		supabase?: SupabaseClient | null;
	};

	const { user = null, supabase = null }: NavbarProps = $props();
	const SIGN_OUT_REDIRECT = '/login';

	let isDropdownOpen = $state(false);
	let profileImageSrc = $state('');
	let signOutForm: HTMLFormElement | undefined;
	let dropdownContainer: HTMLDivElement | undefined;

	$effect(() => {
		profileImageSrc = user?.user_metadata?.avatar_url || '/images/placeholder-avatar.svg';
	});

	function handleProfileImageError() {
		profileImageSrc = '/images/placeholder-avatar.svg';
	}

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function closeDropdown() {
		isDropdownOpen = false;
	}

	async function handleSignOut() {
		closeDropdown();

		if (supabase) {
			try {
				await supabase.auth.signOut({ scope: 'local' });
			} catch (error) {
				console.error('Failed to sign out via Supabase client', error);
			}
		}

		try {
			const formData = signOutForm ? new FormData(signOutForm) : new FormData();
			const response = await fetch('/signout', {
				method: 'POST',
				body: formData,
				credentials: 'same-origin',
				headers: {
					accept: 'application/json'
				}
			});

			if (!response.ok) {
				throw new Error('Failed to invalidate session cookies');
			}
		} catch (error) {
			console.error('Failed to complete server sign-out', error);
			signOutForm?.submit();
			return;
		}

		await invalidate('supabase:auth');
		await invalidateAll();

		try {
			await goto(SIGN_OUT_REDIRECT, { replaceState: true });
		} catch (error) {
			console.error('Failed to navigate with goto, falling back to hard redirect', error);
			window.location.replace(SIGN_OUT_REDIRECT);
		}
	}

	onMount(() => {
		const handleDocumentClick = (event: MouseEvent) => {
			if (!dropdownContainer?.contains(event.target as Node)) {
				closeDropdown();
			}
		};

		document.addEventListener('click', handleDocumentClick);
		return () => document.removeEventListener('click', handleDocumentClick);
	});
</script>

<nav class="bg-white shadow-sm">
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="flex-shrink-0 text-xl font-bold text-blue-600"> Tech Insights </a>
			</div>

			{#if user}
				<div class="relative flex items-center" bind:this={dropdownContainer}>
					<button
						type="button"
						onclick={toggleDropdown}
						class="flex items-center rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
						aria-expanded={isDropdownOpen}
						aria-haspopup="true"
					>
						<img
							class="h-8 w-8 rounded-full object-cover"
							src={profileImageSrc}
							onerror={handleProfileImageError}
							alt="Profile"
							width="32"
							height="32"
						/>
					</button>

					{#if isDropdownOpen}
						<div
							class="ring-opacity-5 absolute top-10 right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu-button"
							tabindex="-1"
						>
							<div class="border-b border-gray-200 px-4 py-2">
								<p class="truncate text-sm font-medium text-gray-900">
									{user.user_metadata?.full_name || user.email}
								</p>
								<p class="truncate text-xs text-gray-500">
									{user.email}
								</p>
							</div>
							<form method="POST" action="/signout" class="contents" bind:this={signOutForm}>
								<button
									type="button"
									onclick={handleSignOut}
									class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
									role="menuitem"
								>
									Sign out
								</button>
							</form>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</nav>
