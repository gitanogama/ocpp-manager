<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import IconDots from '$lib/icons/tabler/IconDots.svelte';
	import IconChargingPile from '$lib/icons/tabler/IconChargingPile.svelte';
	import { createMutationChargerStatus, createQueryChargers } from '$lib/queryClient';
	import { formatDistanceToNow } from 'date-fns';

	const queryChargers = createQueryChargers();
	const mutationChargerStatus = createMutationChargerStatus();

	let dialog: HTMLDialogElement;

	let selectedChargerId: number | null = null;
	let selectedStatus: 'Accepted' | 'Pending' | 'Rejected' | 'Disabled' = 'Accepted';

	const openModal = (id: number, currentStatus: string) => {
		selectedChargerId = id;
		selectedStatus = currentStatus as typeof selectedStatus;
		dialog.showModal();
	};

	const updateStatus = async () => {
		if (!selectedChargerId) return;
		$mutationChargerStatus.mutate(
			{ id: selectedChargerId.toString(), status: selectedStatus },
			{
				onSuccess: () => dialog.close()
			}
		);
	};

	const getStatusClass = (status: string) => {
		return (
			{
				Accepted: 'badge bg-base-200 text-success',
				Pending: 'badge bg-base-200 text-warning',
				Rejected: 'badge bg-base-200 text-neutral',
				Disabled: 'badge bg-base-200 text-secondary'
			}[status] || 'badge'
		);
	};
</script>

<BasePage title="Monitoring">
	<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
		{#if $queryChargers.data}
			{#each $queryChargers.data as charger}
				<div class="card bg-base-200 shadow-md">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<IconChargingPile class="text-primary h-6 w-6" />
								<h2 class="card-title">{charger.model} ({charger.serialNumber})</h2>
							</div>
							<button
								class="btn btn-sm btn-ghost"
								onclick={() => openModal(charger.id, charger.registrationStatus)}
								aria-label="Open status modal"
							>
								<IconDots />
							</button>
						</div>
						<p class="text-sm">
							<span class="font-bold">Vendor:</span>
							{charger.vendor}
						</p>
						<p class="text-sm">
							<span class="font-bold">Status:</span>
							<span
								class={charger.status === 'Online'
									? 'badge bg-base-300 text-success'
									: 'badge bg-base-300 text-error'}
							>
								{charger.status}
							</span>
						</p>
						<p class="text-sm">
							<span class="font-bold">Firmware:</span>
							{charger.firmwareVersion || 'Unknown'}
						</p>
						<p class="text-sm">
							<span class="font-bold">Last Heartbeat:</span>
							<br />
							<small>
								{#if charger.lastHeartbeat}
									{formatDistanceToNow(new Date(charger.lastHeartbeat), { addSuffix: true })}
								{:else}
									<span class="text-base-300">No data</span>
								{/if}
							</small>
						</p>
						<p class="text-sm">
							<span class="font-bold">Registration:</span>
							<span class={getStatusClass(charger.registrationStatus)}>
								{charger.registrationStatus}
							</span>
						</p>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-base-300 text-center">Loading chargers...</p>
		{/if}
	</div>

	<dialog bind:this={dialog} class="modal">
		<form method="dialog" class="modal-box bg-base-200">
			<h3 class="text-lg font-bold">Update Charger Status</h3>
			<p class="py-2">Select a new status for the charger:</p>
			<div class="form-control">
				<!-- svelte-ignore a11y_label_has_associated_control -->
				<label class="label">
					<span class="label-text">Status</span>
				</label>
				<select class="select select-bordered bg-base-100" bind:value={selectedStatus}>
					<option value="Accepted">Accepted</option>
					<option value="Pending">Pending</option>
					<option value="Rejected">Rejected</option>
					<option value="Disabled">Disabled</option>
				</select>
			</div>
			<div class="modal-action">
				<button
					class="btn btn-primary"
					onclick={updateStatus}
					disabled={$mutationChargerStatus.isPending}
				>
					{#if $mutationChargerStatus.isPending}
						<span class="loading loading-spinner"></span>
					{:else}
						Update
					{/if}
				</button>
				<button class="btn" onclick={() => dialog.close()}>Cancel</button>
			</div>
		</form>
	</dialog>
</BasePage>
