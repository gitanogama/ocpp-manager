<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import { createQueryLogs } from '$lib/queryClient';

	const queryLogs = createQueryLogs(5000, 500);
</script>

<BasePage title="Logs">
	<div class="mockup-code min-h-[70svh] w-full text-left">
		<div class="ml-10">
			{#if $queryLogs.data}
				{#each $queryLogs.data as log}
					<p><code>{log}</code></p>
				{/each}
			{:else}
				<p class="text-center">Loading logs...</p>
			{/if}
		</div>
	</div>
</BasePage>
