<script lang="ts">
	import Icon from './Icon.svelte';

	const { size = 20, className = '' } = $props<{
		size?: number | string;
		className?: string;
	}>();
</script>

<Icon {size} {className}>
	<circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="2" fill="none" />
	<path d="m14 14 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</Icon>
