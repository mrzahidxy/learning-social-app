<script lang="ts">
	import type { SupabaseClient, User } from '@supabase/supabase-js';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import NotificationBell from '$lib/features/notifications/components/NotificationBell.svelte';
	import NotificationDropdown from '$lib/features/notifications/components/NotificationDropdown.svelte';
	import { notificationStore } from '$lib/features/notifications/stores/notificationStore.svelte';
	import type { NotificationSummary } from '$lib/features/notifications/types';
	import {
		DEFAULT_NOTIFICATION_LIMIT,
		getNotificationArticleHref
	} from '$lib/features/notifications/utils';

	type NavbarProps = {
		user?: User | null;
		supabase?: SupabaseClient | null;
		profile?: {
			displayName: string | null;
			role: string | null;
			profileImage: string | null;
		} | null;
	};

	const { user = null, supabase = null, profile = null }: NavbarProps = $props();
	const SIGN_OUT_REDIRECT = '/login';
	const FALLBACK_PROFILE_IMAGE = '/images/placeholder-avatar.svg';

	let isDropdownOpen = $state(false);
	let isNotificationsOpen = $state(false);
	let profileImageSrc = $state('');
	let signOutForm = $state<HTMLFormElement>();
	let dropdownContainer = $state<HTMLDivElement>();
	let notificationsContainer = $state<HTMLDivElement>();
	let pendingNotificationIds = $state(new Set<string>());

	const displayName = $derived(
		profile?.displayName || user?.user_metadata?.full_name || user?.email || 'Profile'
	);
	const displayRole = $derived(profile?.role ?? null);
	const preferredProfileImage = $derived(
		profile?.profileImage || user?.user_metadata?.avatar_url || FALLBACK_PROFILE_IMAGE
	);

	$effect(() => {
		profileImageSrc = preferredProfileImage;
	});

	function handleProfileImageError() {
		profileImageSrc = FALLBACK_PROFILE_IMAGE;
	}

	function toggleDropdown() {
		isNotificationsOpen = false;
		isDropdownOpen = !isDropdownOpen;
	}

	function closeDropdown() {
		isDropdownOpen = false;
	}

	async function toggleNotifications() {
		isDropdownOpen = false;
		isNotificationsOpen = !isNotificationsOpen;

		if (isNotificationsOpen) {
			await notificationStore.loadInitial({ limit: DEFAULT_NOTIFICATION_LIMIT });
		}
	}

	function closeNotifications() {
		isNotificationsOpen = false;
	}

	async function openNotification(notification: NotificationSummary) {
		pendingNotificationIds.add(notification.id);
		const success = await notificationStore.markOneAsRead(notification.id);
		pendingNotificationIds.delete(notification.id);

		if (success) {
			closeNotifications();
			await goto(getNotificationArticleHref(notification.articleId));
		}
	}

	async function markNotificationReadOnly(notification: NotificationSummary) {
		pendingNotificationIds.add(notification.id);
		await notificationStore.markOneAsRead(notification.id);
		pendingNotificationIds.delete(notification.id);
	}

	async function handleMarkAllNotificationsRead() {
		await notificationStore.markAllAsRead();
	}

	async function handleViewAllNotifications() {
		closeNotifications();
		await goto('/user/notifications');
	}

	async function handleSignOut() {
		closeDropdown();
		closeNotifications();
		notificationStore.reset();

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

	const handleDocumentClick = (event: MouseEvent) => {
		if (!dropdownContainer?.contains(event.target as Node)) {
			closeDropdown();
		}

		if (!notificationsContainer?.contains(event.target as Node)) {
			closeNotifications();
		}
	};

	const handleEscape = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			closeDropdown();
			closeNotifications();
		}
	};

	onMount(() => {
		document.addEventListener('click', handleDocumentClick);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('click', handleDocumentClick);
			document.removeEventListener('keydown', handleEscape);
		};
	});
</script>

<nav class="bg-white shadow-sm">
	<div class="px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center">
				<a href="/" class="flex-shrink-0 text-xl font-bold text-blue-600"> Tech Insights </a>
			</div>

			{#if user}
				<div class="flex items-center gap-3">
					<div class="relative" bind:this={notificationsContainer}>
						<NotificationBell
							isOpen={isNotificationsOpen}
							isLoading={notificationStore.initialLoading && !notificationStore.hasLoaded}
							unreadCount={notificationStore.unreadCount}
							onToggle={toggleNotifications}
						/>

						{#if isNotificationsOpen}
							<NotificationDropdown
								isLoading={notificationStore.initialLoading}
								error={notificationStore.error}
								notifications={notificationStore.notifications.slice(0, 8)}
								unreadCount={notificationStore.unreadCount}
								onRetry={() =>
									notificationStore.loadInitial({ limit: DEFAULT_NOTIFICATION_LIMIT }, true)}
								onMarkAllRead={handleMarkAllNotificationsRead}
								onOpenNotification={openNotification}
								onMarkRead={markNotificationReadOnly}
								onViewAll={handleViewAllNotifications}
							/>
						{/if}
					</div>

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
								<a
									href="/user/profile"
									class="block border-b border-gray-200 px-4 py-2 hover:bg-gray-50"
									role="menuitem"
								>
									<p class="truncate text-sm font-medium text-gray-900">
										{displayName}
									</p>
									<p class="truncate text-xs text-gray-500">
										{user.email}
									</p>
									{#if displayRole}
										<span
											class="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-700"
										>
											{displayRole}
										</span>
									{/if}
								</a>
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
				</div>
			{:else}
				<div class="flex items-center">
					<a href="/login" class="text-sm font-medium text-blue-600 hover:text-blue-500">Sign in</a>
				</div>
			{/if}
		</div>
	</div>
</nav>
