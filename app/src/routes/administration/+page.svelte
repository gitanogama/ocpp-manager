<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import { createMutationSetting, createQuerySetting } from '$lib/queryClient';
	const querySettings = createQuerySetting();
	const mutationSettings = createMutationSetting();

	let heartbeatInterval = $state(0);
	let systemMaintenance = $state(false);
	let meterValueSampleInterval = $state(0);

	$effect(() => {
		if ($querySettings.data) {
			heartbeatInterval = $querySettings.data.heartbeatInterval;
			systemMaintenance = Boolean($querySettings.data.systemMaintenance);
			meterValueSampleInterval = $querySettings.data.meterValueSampleInterval;
		}
	});

	function updateSettings() {
		$mutationSettings.mutate({
			heartbeatInterval,
			systemMaintenance
		});
	}
</script>

<BasePage title="Administration">
	<div class="max-w-xl space-y-6 p-4">
		{#if $querySettings.isPending}
			<p class="text-center">Loading settings...</p>
		{:else}
			<div class="form-control">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-2 block text-sm font-medium">Heartbeat Interval (seconds)</label>
				<input
					type="number"
					class="input input-bordered w-full"
					bind:value={heartbeatInterval}
					placeholder="300"
					disabled={$mutationSettings.isPending}
				/>
			</div>

			<div class="form-control">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-2 block text-sm font-medium">Meter Value Sample Interval (seconds)</label>
				<input
					type="number"
					class="input input-bordered w-full"
					bind:value={meterValueSampleInterval}
					placeholder="300"
					disabled={$mutationSettings.isPending}
				/>
			</div>

			<div class="form-control">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="mb-2 block text-sm font-medium">System Maintenance</label>
				<input
					type="checkbox"
					class="toggle toggle-primary"
					bind:checked={systemMaintenance}
					disabled={$mutationSettings.isPending}
				/>
			</div>

			<button
				class="btn btn-primary w-full"
				onclick={updateSettings}
				disabled={$mutationSettings.isPending}
			>
				{#if $mutationSettings.isPending}
					<span class="loading loading-spinner"></span>
				{:else}
					Update Settings
				{/if}
			</button>
		{/if}
	</div>
</BasePage>
