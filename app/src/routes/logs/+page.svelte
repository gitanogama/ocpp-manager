<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';
	import { createQueryLogs } from '$lib/queryClient';

	const queryLogs = createQueryLogs(5000, 500);
</script>

<BasePage title="Logs">
	<div class="mockup-code w-full text-left">
		<Scrollable class="ml-10" maxHeight="80svh">
			{#if $queryLogs.data}
				{#each $queryLogs.data as log}
					<p><code>{log}</code></p>
				{/each}
			{:else}
				<p class="text-center">Loading logs...</p>
			{/if}
		</Scrollable>
	</div>
</BasePage>
