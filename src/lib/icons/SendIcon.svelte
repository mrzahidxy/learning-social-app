<script lang="ts">
	import Icon from './Icon.svelte';

	const { size = 20, className = '' } = $props<{
		size?: number | string;
		className?: string;
	}>();
</script>

<Icon {size} {className}>
	<path
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="2"
		d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
		fill="none"
		transform="rotate(90 12 12)"
	/>
</Icon>