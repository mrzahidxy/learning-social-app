<script lang="ts">
	import Icon from './Icon.svelte';

	const { size = 20, className = '' } = $props<{
		size?: number | string;
		className?: string;
	}>();
</script>

<Icon {size} {className}>
	<path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</Icon>