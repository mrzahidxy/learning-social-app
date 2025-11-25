<script lang="ts">
	import Icon from './Icon.svelte';

	const { size = 20, className = '' } = $props<{
		size?: number | string;
		className?: string;
	}>();
</script>

<Icon {size} {className}>
	<path
		fill-rule="evenodd"
		d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
		clip-rule="evenodd"
	/>
</Icon>