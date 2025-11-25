<script lang="ts">
	import MagicLinkForm from '$lib/features/auth/components/MagicLinkForm.svelte';
</script>

<svelte:head>
	<title>Magic Link Authentication - Secure Passwordless Login</title>
	<meta
		name="description"
		content="Sign in securely with magic links - no passwords required. Enter your email and receive an instant login link."
	/>
	<meta
		name="keywords"
		content="magic link, passwordless authentication, secure login, email authentication"
	/>
</svelte:head>

<MagicLinkForm />
