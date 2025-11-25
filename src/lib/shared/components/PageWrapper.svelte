<script lang="ts">
	type Props = {
		children: import('svelte').Snippet;
		paddingX?: string;
		paddingY?: string;
		class?: string;
	};

	let { children, paddingX = 'px-4', paddingY = 'py-8', class: extraClass = '' }: Props = $props();

	const defaultClasses = `mx-auto w-full max-w-6xl ${paddingX} ${paddingY} sm:px-6 lg:px-8`;
</script>

<div class={defaultClasses + ' ' + extraClass}>
	{@render children()}
</div>
