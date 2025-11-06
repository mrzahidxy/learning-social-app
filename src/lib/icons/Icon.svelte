<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		size = 20,
		className = '',
		ariaHidden = true,
		title
	} = $props<{
		size?: number | string;
		className?: string;
		children: Snippet;
		ariaHidden?: boolean;
		title?: string;
	}>();
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	width={size}
	height={size}
	aria-hidden={ariaHidden}
	role={title ? 'img' : 'presentation'}
	class={className}
	viewBox="0 0 20 20"
	fill="currentColor"
>
	{@render children()}
</svg>
