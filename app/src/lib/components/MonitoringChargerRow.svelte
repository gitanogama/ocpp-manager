<script lang="ts">
	import type { hClient } from '$lib/hClient';
	import IconChargingPile from '$lib/icons/tabler/IconChargingPile.svelte';
	import IconDots from '$lib/icons/tabler/IconDots.svelte';
	import {
		createMutationChargerDelete,
		createMutationChargerUpdate,
		createQueryConnectorsOfCharger
	} from '$lib/queryClient';
	import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
	import type { InferResponseType } from 'hono';

	const { charger }: { charger: InferResponseType<(typeof hClient)['chargers']['$get']>[0] } =
		$props();

	const queryConnectors = createQueryConnectorsOfCharger(charger.id.toString());

	const mutationChargerUpdate = createMutationChargerUpdate();
	const mutationChargerDelete = createMutationChargerDelete();

	let dialog: HTMLDialogElement;

	let selectedChargerId = $state<number | null>(null);
	let inputFriendlyName = $state('');
	let inputShortcode = $state('');
	let inputStatus = $state<'Accepted' | 'Rejected' | 'Pending'>('Pending');

	const deleteCharger = () => {
		if (!selectedChargerId) return;
		$mutationChargerDelete.mutate(
			{ id: selectedChargerId.toString() },
			{ onSuccess: () => dialog.close() }
		);
	};

	const openModal = (inputCharger: typeof charger) => {
		selectedChargerId = inputCharger.id;
		inputFriendlyName = inputCharger.friendlyName;
		inputShortcode = inputCharger.shortcode;
		inputStatus = inputCharger.status as typeof inputStatus;
		dialog.showModal();
	};

	const updateCharger = () => {
		if (!selectedChargerId) return;
		$mutationChargerUpdate.mutate(
			{
				id: selectedChargerId.toString(),
				friendlyName: inputFriendlyName,
				status: inputStatus,
				shortcode: inputShortcode
			},
			{ onSuccess: () => dialog.close() }
		);
	};

	const getStatusColor = (status: string) => {
		const colors = {
			Available: 'bg-success',
			Preparing: 'bg-info',
			Charging: 'bg-primary',
			SuspendedEVSE: 'bg-warning',
			SuspendedEV: 'bg-warning',
			Finishing: 'bg-info',
			Reserved: 'bg-secondary',
			Unavailable: 'bg-base-300',
			Faulted: 'bg-error'
		};
		return (colors as any)[status] || 'bg-base-300';
	};

	const statusBadge = (status: string) => {
		const classes = {
			Pending: 'badge badge-warning',
			Accepted: 'badge badge-success',
			Rejected: 'badge badge-neutral'
		};
		return (classes as any)[status] || 'badge';
	};
</script>

<div class="card bg-base-200 shadow-lg">
	<div class="card-body p-6">
		<div class="mb-4 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<IconChargingPile class="text-primary h-8 w-8" />
				<h2 class="text-xl font-bold">{charger.friendlyName || 'Unknown'}</h2>
			</div>
			<button
				class="btn btn-ghost btn-square"
				onclick={() => openModal(charger)}
				aria-label="Edit Charger"
			>
				<IconDots class="h-6 w-6" />
			</button>
		</div>

		<div class="grid gap-6 md:grid-cols-2">
			<div class="space-y-3">
				<p class="flex items-center gap-2">
					<span class="font-semibold">Serial:</span>
					{charger.serialNumber}
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Firmware:</span>
					{charger.firmwareVersion}
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Vendor:</span>
					{charger.vendor}
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Model:</span>
					{charger.model}
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Status:</span>
					<span class={statusBadge(charger.status)}>{charger.status}</span>
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Last Heartbeat:</span>
					<span class="badge badge-neutral">
						{charger.lastHeartbeat
							? formatDistanceToNow(new Date(charger.lastHeartbeat), {
									addSuffix: true
								})
							: 'N/A'}
					</span>
				</p>
				<p class="flex items-center gap-2">
					<span class="font-semibold">Shortcode:</span>
					{charger.shortcode}
				</p>
			</div>

			<div class="space-y-4">
				<h3 class="text-lg font-bold">Connectors</h3>
				<div class="grid gap-4 sm:grid-cols-2">
					{#if $queryConnectors.data}
						{#each $queryConnectors.data as connector}
							<div class="bg-base-100 rounded-lg p-4 shadow-sm">
								<div class="mb-3 flex items-center justify-between">
									<p class="text-sm font-medium">{connector.status}</p>
									<div class={`h-2 w-16 rounded-full ${getStatusColor(connector.status)}`} />
								</div>

								<p class="mb-2 font-bold">Connector {connector.connectorId}</p>
								<p class="text-sm">Max Current: {connector.maxCurrent}A</p>
								{#if connector.errorCode}
									<p class="text-error mt-3 text-sm font-medium">Error: {connector.errorCode}</p>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<dialog bind:this={dialog} class="modal">
	<form onsubmit={updateCharger} method="dialog" class="modal-box bg-base-100 max-w-md">
		<h3 class="mb-6 text-xl font-bold">Edit Charger</h3>
		<div class="space-y-4">
			<div class="form-control">
				<label class="label font-medium">Friendly Name</label>
				<input
					type="text"
					required
					minlength="1"
					class="input input-bordered w-full"
					bind:value={inputFriendlyName}
				/>
			</div>
			<div class="form-control">
				<label class="label font-medium">Shortcode</label>
				<input
					type="text"
					required
					minlength="1"
					class="input input-bordered w-full"
					bind:value={inputShortcode}
				/>
			</div>
			<div class="form-control">
				<label class="label font-medium">Status</label>
				<select class="select select-bordered w-full" bind:value={inputStatus}>
					<option value="Pending">Pending</option>
					<option value="Accepted">Accepted</option>
					<option value="Rejected">Rejected</option>
				</select>
			</div>
		</div>
		<div class="modal-action mt-8">
			<button class="btn btn-error mr-auto" onclick={deleteCharger} type="button">Delete</button>
			<button class="btn btn-primary" type="submit">Update</button>
			<button class="btn" onclick={() => dialog.close()}>Cancel</button>
		</div>
	</form>
</dialog>
