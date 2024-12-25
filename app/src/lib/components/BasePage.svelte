<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		class: className = '',
		title,
		children
	}: { class?: string; title: string; children?: Snippet<[]> } = $props();
</script>

<div class="ml-10 {className}">
	<p class="mb-10 text-4xl font-bold">{title}</p>

	<div>
		{@render children?.()}
	</div>
</div>
