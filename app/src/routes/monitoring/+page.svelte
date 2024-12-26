<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import IconDots from '$lib/icons/tabler/IconDots.svelte';
	import IconChargingPile from '$lib/icons/tabler/IconChargingPile.svelte';
	import {
		createMutationChargerUpdate,
		createMutationChargerCreate,
		createQueryChargers,
		createMutationChargerDelete
	} from '$lib/queryClient';
	import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

	const queryChargers = createQueryChargers();
	const mutationChargerUpdate = createMutationChargerUpdate();
	const mutationChargerCreate = createMutationChargerCreate();
	const mutationChargerDelete = createMutationChargerDelete();

	let dialog: HTMLDialogElement;
	let createDialog: HTMLDialogElement;

	let selectedChargerId = $state<number | null>(null);
	let inputFriendlyName = $state('');
	let inputShortcode = $state('');
	let inputEnabled = $state(false);

	const openModal = (charger: NonNullable<typeof $queryChargers.data>[0]) => {
		selectedChargerId = charger.id;
		inputFriendlyName = charger.friendlyName;
		inputShortcode = charger.shortcode;
		inputEnabled = Boolean(charger.enabled);
		dialog.showModal();
	};

	const openCreateModal = () => {
		inputFriendlyName = '';
		inputShortcode = '';
		inputEnabled = false;
		createDialog.showModal();
	};

	const updateCharger = async () => {
		if (!selectedChargerId) return;
		$mutationChargerUpdate.mutate(
			{
				id: selectedChargerId.toString(),
				friendlyName: inputFriendlyName,
				enabled: inputEnabled,
				shortcode: inputShortcode
			},
			{
				onSuccess: () => dialog.close()
			}
		);
	};

	const createCharger = async () => {
		$mutationChargerCreate.mutate(
			{
				friendlyName: inputFriendlyName,
				shortcode: inputShortcode
			},
			{
				onSuccess: () => createDialog.close()
			}
		);
	};

	const deleteCharger = async () => {
		if (!selectedChargerId) return;
		$mutationChargerDelete.mutate(
			{ id: selectedChargerId.toString() },
			{
				onSuccess: () => dialog.close()
			}
		);
	};
</script>

<BasePage title="Monitoring">
	<div class="mb-4 flex justify-between">
		<h1 class="text-lg font-bold">Chargers</h1>
		<button class="btn btn-primary" onclick={openCreateModal}>Add Charger</button>
	</div>

	<div class="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
		{#if $queryChargers.data}
			{#each $queryChargers.data as charger}
				<div class="card bg-base-200 shadow-md">
					<div class="card-body">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<IconChargingPile class="text-primary h-6 w-6" />
								<h2 class="card-title">{charger.friendlyName || 'Unknown'}</h2>
							</div>
							<button
								class="btn btn-sm btn-ghost"
								onclick={() => openModal(charger)}
								aria-label="Edit Charger"
							>
								<IconDots />
							</button>
						</div>
						<p class="text-sm">
							<span class="font-bold">Serial Number:</span>
							{charger.serialNumber}
						</p>
						<p class="text-sm">
							<span class="font-bold">Firmware Version:</span>
							{charger.firmwareVersion}
						</p>
						<p class="text-sm">
							<span class="font-bold">Vendor:</span>
							{charger.vendor}
						</p>
						<p class="text-sm">
							<span class="font-bold">Model:</span>
							{charger.model}
						</p>

						<p class="text-sm">
							<span class="font-bold">Status</span>
							{charger.enabled === 1 ? 'Enabled' : 'Disabled'}
						</p>
						<p class="text-sm">
							<span class="font-bold">Last Heartbeat:</span>
							{charger.lastHeartbeat ? formatDistanceToNow(new Date(charger.lastHeartbeat)) : 'N/A'}
						</p>
						<p class="text-sm">
							<span class="font-bold">Shortcode:</span>
							{charger.shortcode}
						</p>
					</div>
				</div>
			{/each}
		{:else}
			<p class="text-base-300 text-center">Loading chargers...</p>
		{/if}
	</div>

	<dialog bind:this={dialog} class="modal">
		<form onsubmit={updateCharger} method="dialog" class="modal-box bg-base-200">
			<h3 class="text-lg font-bold">Edit Charger</h3>
			<div class="form-control">
				<label class="label">Friendly Name</label>
				<input
					required
					minlength="1"
					type="text"
					class="input input-bordered"
					bind:value={inputFriendlyName}
				/>
			</div>
			<div class="form-control">
				<label class="label">Shortcode</label>
				<input
					required
					minlength="1"
					type="text"
					class="input input-bordered"
					bind:value={inputShortcode}
				/>
			</div>
			<div class="form-control">
				<label class="label cursor-pointer">
					<span>Enabled</span>
					<input type="checkbox" class="toggle toggle-primary" bind:checked={inputEnabled} />
				</label>
			</div>
			<div class="modal-action flex justify-between">
				<button
					class="btn btn-error"
					onclick={deleteCharger}
					type="button"
					disabled={$mutationChargerDelete.isPending}
				>
					{#if $mutationChargerDelete.isPending}
						<span class="loading loading-spinner"></span>
					{:else}
						Delete
					{/if}
				</button>
				<div>
					<button class="btn btn-primary" type="submit" disabled={$mutationChargerUpdate.isPending}>
						{#if $mutationChargerUpdate.isPending}
							<span class="loading loading-spinner"></span>
						{:else}
							Update
						{/if}
					</button>
					<button class="btn" onclick={() => dialog.close()}>Cancel</button>
				</div>
			</div>
		</form>
	</dialog>

	<dialog bind:this={createDialog} class="modal">
		<form onsubmit={createCharger} method="dialog" class="modal-box bg-base-200">
			<h3 class="text-lg font-bold">Add Charger</h3>
			<div class="form-control">
				<label class="label">Friendly Name</label>
				<input
					required
					minlength="1"
					type="text"
					class="input input-bordered"
					bind:value={inputFriendlyName}
				/>
			</div>
			<div class="form-control">
				<label class="label">Shortcode</label>
				<input
					required
					minlength="1"
					type="text"
					class="input input-bordered"
					bind:value={inputShortcode}
				/>
			</div>

			<div class="modal-action">
				<button class="btn btn-primary" type="submit" disabled={$mutationChargerCreate.isPending}>
					{#if $mutationChargerCreate.isPending}
						<span class="loading loading-spinner"></span>
					{:else}
						Create
					{/if}
				</button>
				<button class="btn" onclick={() => createDialog.close()}>Cancel</button>
			</div>
		</form>
	</dialog>
</BasePage>
