<script lang="ts">
	import Icon from './Icon.svelte';

	const { size = 20,  className = '' } = $props<{
		size?: number | string;
		className?: string;
	}>();
</script>

<Icon {size}  {className} >
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M3.172 5.172a4 4 0 0 1 5.656 0L10 6.343l1.172-1.171a4 4 0 1 1 5.656 5.656L10 17.657 3.172 10.828a4 4 0 0 1 0-5.656z"
	/>
</Icon>