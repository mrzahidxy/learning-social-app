<script>
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Navbar from '$lib/shared/components/navbar/Navbar.svelte';
	let { data, children } = $props();
	let { supabase, user, profile } = $derived(data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(async (event) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				await invalidate('supabase:auth');
			}
		});
		return () => subscription.unsubscribe();
	});
</script>

<Navbar {user} {profile} />

{@render children()}
