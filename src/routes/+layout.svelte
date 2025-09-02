<script>
	import '../app.css';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	let { data, children } = $props();
	let { session, supabase } = $derived(data);

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

{#if session}
	<form method="POST" action="/signout" class="absolute top-4 right-4">
		<button class="cursor-pointer bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
			Sign out
		</button>
	</form>
{/if}

{@render children()}
