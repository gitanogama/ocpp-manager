<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import { createMutationSetting, createQuerySetting } from '$lib/queryClient';
	const querySettings = createQuerySetting();
	const mutationSettings = createMutationSetting();

	let heartbeatInterval = $state(0);
	let systemMaintenance = $state(false);
	let meterValueSampleInterval = $state(0);
	let clockAlignedDataInterval = $state(0);

	$effect(() => {
		if ($querySettings.data) {
			heartbeatInterval = $querySettings.data.heartbeatInterval;
			systemMaintenance = Boolean($querySettings.data.systemMaintenance);
			meterValueSampleInterval = $querySettings.data.meterValueSampleInterval;
			clockAlignedDataInterval = $querySettings.data.clockAlignedDataInterval;
		}
	});

	function updateSettings() {
		$mutationSettings.mutate({
			heartbeatInterval,
			systemMaintenance,
			meterValueSampleInterval,
			clockAlignedDataInterval
		});
	}
</script>

<BasePage title="Administration">
	<div class="max-w-xl p-4">
		{#if $querySettings.isPending}
			<p class="text-center">Loading settings...</p>
		{:else}
			<form
				class="space-y-6"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					updateSettings();
				}}
			>
				<div class="form-control">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label for="heartbeatInterval" class="mb-2 block text-sm font-medium"
						>Heartbeat Interval (seconds)</label
					>
					<input
						id="heartbeatInterval"
						type="number"
						class="input input-bordered w-full"
						bind:value={heartbeatInterval}
						placeholder="300"
						min="10"
						max="99999"
						required
						disabled={$mutationSettings.isPending}
					/>
				</div>

				<div class="form-control">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label for="meterValueSampleInterval" class="mb-2 block text-sm font-medium"
						>Meter Value Sample Interval (seconds)</label
					>
					<input
						id="meterValueSampleInterval"
						type="number"
						class="input input-bordered w-full"
						bind:value={meterValueSampleInterval}
						placeholder="60"
						min="10"
						max="99999"
						required
						disabled={$mutationSettings.isPending}
					/>
				</div>

				<div class="form-control">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label for="clockAlignedDataInterval" class="mb-2 block text-sm font-medium"
						>Clock Aligned Data Interval (seconds)</label
					>
					<input
						id="clockAlignedDataInterval"
						type="number"
						class="input input-bordered w-full"
						bind:value={clockAlignedDataInterval}
						placeholder="60"
						min="10"
						max="99999"
						required
						disabled={$mutationSettings.isPending}
					/>
				</div>

				<div class="form-control">
					<!-- svelte-ignore a11y_label_has_associated_control -->
					<label for="systemMaintenance" class="mb-2 block text-sm font-medium"
						>System Maintenance</label
					>
					<input
						id="systemMaintenance"
						type="checkbox"
						class="toggle toggle-primary"
						bind:checked={systemMaintenance}
						disabled={$mutationSettings.isPending}
					/>
				</div>

				<button type="submit" class="btn btn-primary w-full" disabled={$mutationSettings.isPending}>
					{#if $mutationSettings.isPending}
						<span class="loading loading-spinner"></span>
					{/if} Update Settings
				</button>
			</form>
		{/if}
	</div>
</BasePage>
