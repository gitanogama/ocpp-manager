<script lang="ts">
	import type { hClient } from '$lib/hClient';
	import IconChargingPile from '$lib/icons/tabler/IconChargingPile.svelte';
	import IconPlug from '$lib/icons/tabler/IconPlug.svelte';
	import IconChevronRight from '$lib/icons/tabler/IconChevronRight.svelte';
	import {
		createMutationChargerDelete,
		createMutationChargerUpdate,
		createQueryConnectorsOfCharger
	} from '$lib/queryClient';
	import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
	import type { InferResponseType } from 'hono';

	const { charger }: { charger: InferResponseType<(typeof hClient)['chargers']['$get']>[0] } =
		$props();

	const queryConnectors = createQueryConnectorsOfCharger(charger.id.toString(), 10000);

	const mutationChargerUpdate = createMutationChargerUpdate();
	const mutationChargerDelete = createMutationChargerDelete();

	let dialog: HTMLDialogElement;
	let inputFriendlyName = $state(charger.friendlyName || '');
	let inputShortcode = $state(charger.shortcode || '');
	let inputStatus = $state<'Accepted' | 'Rejected' | 'Pending'>(charger.status as any);

	const updateCharger = () => {
		$mutationChargerUpdate.mutate({
			id: charger.id.toString(),
			friendlyName: inputFriendlyName,
			status: inputStatus,
			shortcode: inputShortcode
		});
		dialog.close();
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

	function deleteCharger() {
		$mutationChargerDelete.mutate({
			id: charger.id.toString()
		});
	}
</script>

<div class="bg-base-200 rounded-lg p-6 shadow-md">
	<!-- Charger Header with Status -->
	<div class="mb-6 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<IconChargingPile class="text-primary h-10 w-10" />
			<div>
				<h2 class="text-2xl font-semibold">
					{charger.friendlyName || 'Unknown'}
				</h2>
				<p class="text-sm text-gray-500">{charger.vendor || 'Unknown Vendor'}</p>
			</div>
		</div>
		<!-- Edit Button -->
		<button class="btn btn-ghost btn-sm" onclick={() => dialog.showModal()}> Edit </button>
	</div>

	<!-- Charger Status -->
	<div class="mb-6">
		<span
			class="badge badge-lg badge-outline p-3"
			class:badge-warning={charger.status === 'Pending'}
			class:badge-success={charger.status === 'Accepted'}
		>
			{charger.status || 'Unknown'}
		</span>
	</div>

	<!-- Charger Information Table -->
	<table class="bg-base-300 table w-full overflow-hidden rounded-lg">
		<tbody>
			<tr>
				<td class="w-60 font-medium">Connectivity</td>
				<td>
					<span
						class={`badge badge-outline ${charger.connectivity === 'Online' ? 'badge-success' : 'badge-warning'} p-3 text-white`}
					>
						{charger.connectivity || 'Unknown'}
					</span>
				</td>
			</tr>
			<tr>
				<td class="w-60 font-medium">Firmware</td>
				<td>{charger.firmwareVersion || 'N/A'}</td>
			</tr>
			<tr>
				<td class="w-60 font-medium">Model</td>
				<td>{charger.model || 'N/A'}</td>
			</tr>
			<tr>
				<td class="w-60 font-medium">Last Heartbeat</td>
				<td>
					{charger.lastHeartbeat
						? formatDistanceToNow(new Date(charger.lastHeartbeat), { addSuffix: true })
						: 'N/A'}
				</td>
			</tr>
			<tr>
				<td class="w-60 font-medium">Shortcode</td>
				<td>{charger.shortcode || 'N/A'}</td>
			</tr>
		</tbody>
	</table>

	<!-- Connectors Section -->
	<div class="mt-6">
		<h3 class="mb-4 text-xl font-bold">Connectors</h3>
		<div class="space-y-4">
			{#if $queryConnectors.data}
				{#each $queryConnectors.data as connector}
					<button
						class="bg-base-300 hover:bg-base-100 flex w-full items-center justify-between rounded-lg p-4 shadow"
					>
						<div class="flex items-center gap-4">
							<IconPlug class=" h-6 w-6 text-current" />
							<div class="flex flex-col text-left">
								<span class="font-bold">Connector {connector.connectorId}</span>
								<span class="text-sm">Max Current: {connector.maxCurrent}A</span>
								{#if connector.errorCode}
									<p class="text-error mt-1 text-sm">Error: {connector.errorCode}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-center gap-4">
							<div class="flex items-center gap-4">
								<p class="text-sm font-medium">{connector.status}</p>
								<div class={`h-2 w-16 rounded-full ${getStatusColor(connector.status)}`}></div>
							</div>
							<IconChevronRight class="h-5 w-5 text-gray-400" />
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Edit Charger Modal -->
<dialog bind:this={dialog} class="modal">
	<form method="dialog" class="modal-box">
		<h3 class="text-lg font-bold">Edit Charger</h3>
		<div class="mt-4 space-y-4">
			<div class="form-control">
				<label class="label">
					<span class="label-text">Friendly Name</span>
				</label>
				<input type="text" class="input input-bordered" bind:value={inputFriendlyName} />
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Shortcode</span>
				</label>
				<input type="text" class="input input-bordered" bind:value={inputShortcode} />
			</div>
			<div class="form-control">
				<label class="label">
					<span class="label-text">Status</span>
				</label>
				<select class="select select-bordered" bind:value={inputStatus}>
					<option value="Pending">Pending</option>
					<option value="Accepted">Accepted</option>
					<option value="Rejected">Rejected</option>
				</select>
			</div>
		</div>
		<div class="modal-action">
			<button class="btn btn-error btn-outline mr-auto" onclick={deleteCharger}> Delete </button>
			<button class="btn btn-primary" type="submit" onclick={updateCharger}> Save </button>
			<button class="btn" onclick={() => dialog.close()}> Cancel </button>
		</div>
	</form>
</dialog>
