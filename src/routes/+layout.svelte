<script>
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { notificationStore } from '$lib/features/notifications/stores/notificationStore.svelte';
	import Navbar from '$lib/shared/components/navbar/Navbar.svelte';
	let { data, children } = $props();
	let { supabase, user, profile } = $derived(data);

	$effect(() => {
		if (!user) {
			notificationStore.reset();
		}
	});

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				await invalidate('supabase:auth');
			}
		});
		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<Navbar {user} {profile} {supabase} />

{@render children()}
