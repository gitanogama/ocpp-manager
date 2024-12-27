<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import { createMutationChargerCreate, createQueryChargers } from '$lib/queryClient';
	import MonitoringChargerRow from '$lib/components/MonitoringChargerRow.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';

	const queryChargers = createQueryChargers(10000);

	const mutationChargerCreate = createMutationChargerCreate();

	let inputFriendlyName = $state('');
	let inputShortcode = $state('');
	let inputStatus = $state<'Accepted' | 'Rejected' | 'Pending'>('Pending');

	const openCreateModal = () => {
		inputFriendlyName = '';
		inputShortcode = '';
		inputStatus = 'Accepted';
		createDialog.showModal();
	};

	const createCharger = () => {
		$mutationChargerCreate.mutate(
			{ friendlyName: inputFriendlyName, shortcode: inputShortcode },
			{ onSuccess: () => createDialog.close() }
		);
	};

	let createDialog: HTMLDialogElement;
</script>

<BasePage title="Monitoring">
	<div class="container mx-auto px-4">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Chargers</h1>
			<button class="btn btn-primary" onclick={openCreateModal}>Add Charger</button>
		</div>
		<Scrollable class="p-4" maxHeight="80svh">
			<div class="space-y-6">
				{#if $queryChargers.data}
					{#each $queryChargers.data as charger}
						<MonitoringChargerRow {charger} />
					{/each}
				{:else}
					<div class="bg-base-200 rounded-lg p-8 text-center">
						<p class="text-base-content">Loading chargers...</p>
					</div>
				{/if}
			</div>
		</Scrollable>
	</div>
</BasePage>

<dialog bind:this={createDialog} class="modal">
	<form onsubmit={createCharger} method="dialog" class="modal-box bg-base-200">
		<h3 class="text-lg font-bold">Add Charger</h3>
		<div class="form-control">
			<label class="label">Friendly Name</label>
			<input
				type="text"
				required
				minlength="1"
				class="input input-bordered"
				bind:value={inputFriendlyName}
			/>
		</div>
		<div class="form-control">
			<label class="label">Shortcode</label>
			<input
				type="text"
				required
				minlength="1"
				class="input input-bordered"
				bind:value={inputShortcode}
			/>
		</div>
		<div class="modal-action">
			<button class="btn btn-primary" type="submit">Create</button>
			<button class="btn" onclick={() => createDialog.close()}>Cancel</button>
		</div>
	</form>
</dialog>
