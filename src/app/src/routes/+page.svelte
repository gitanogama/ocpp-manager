<script lang="ts">
	import { onMount } from 'svelte';
	import { hc } from 'hono/client';
	import type { AppType } from '../../../main';

	const client = hc<AppType>('http://localhost:8787/');

	onMount(() => {
		window.location.href = '/monitoring';
	});
</script>
