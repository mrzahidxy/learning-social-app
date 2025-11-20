<script>
	import '../app.css';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/navbar/Navbar.svelte';
	let { data, children } = $props();
	let { supabase, user } = $derived(data);

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

<Navbar {user} />

{@render children()}
