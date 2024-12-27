<script lang="ts">
	import {
		createQueryChargeAuthorization,
		createMutationChargeAuthorizationCreate,
		createMutationChargeAuthorizationUpdate,
		createMutationChargeAuthorizationDelete,
		createQueryCharger,
		createQueryRfidTag
	} from '$lib/queryClient';
	import { drawerStore, type DrawerState, type Field } from '$lib/drawerStore';
	import { z } from 'zod';
	import { formatDistanceToNow } from 'date-fns';
	import BasePage from '$lib/components/BasePage.svelte';
	import { hClient } from '$lib/hClient';
	import IconLockPin from '$lib/icons/tabler/IconLockPin.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';

	const queryChargeAuthorizations = createQueryChargeAuthorization(10000);
	const queryChargers = createQueryCharger(10000);
	const queryRfidTags = createQueryRfidTag(10000);

	const mutationChargeAuthorizationCreate = createMutationChargeAuthorizationCreate();
	const mutationChargeAuthorizationUpdate = createMutationChargeAuthorizationUpdate();
	const mutationChargeAuthorizationDelete = createMutationChargeAuthorizationDelete();

	const openCreateDrawer = () => {
		const fields = [
			{
				label: 'Charger ID',
				name: 'chargerId',
				type: 'dropdown',
				options: $queryChargers.data
					? $queryChargers.data.map((charger) => ({
							label: `${charger.friendlyName} (${charger.vendor})`,
							value: charger.id.toString()
						}))
					: [],

				validation: z.string().min(1),
				onChange: async (value) => {
					if (!value) return;
					const connectors = await hClient.connector.charger[':id']
						.$get({
							param: {
								id: value
							}
						})
						.then((res) => res.json());

					drawerStore.overwriteDeep((state) => {
						const connectorField = state.fields.find((field) => field.name === 'connectorId');
						if (!connectorField || connectorField.type !== 'dropdown') return;

						connectorField.options = [
							{ label: 'All', value: '' },
							...connectors.map((connector) => ({
								label: connector.id.toString(),
								value: connector.id.toString()
							}))
						];

						return state;
					});
				}
			},
			{
				label: 'Connector ID',
				name: 'connectorId',
				type: 'dropdown',
				options: [],
				validation: z.string()
			},
			{
				label: 'Expiry Date',
				name: 'expiryDate',
				type: 'date',
				defaultValue: '',
				validation: z.string()
			},
			{
				label: 'RFID Tag ID',
				name: 'rfidTagId',
				type: 'dropdown',
				options: $queryRfidTags.data
					? $queryRfidTags.data.map((tag) => ({
							label: `${tag.friendlyName} (${tag.rfidTag})`,
							value: tag.id.toString()
						}))
					: [],

				validation: z.string().min(1)
			},
			{
				label: 'Watt Limit',
				name: 'wLimit',
				type: 'number',

				validation: z.coerce.number().nullable()
			}
		] as const satisfies Field[];

		const drawerContent = {
			header: 'Add Charge Authorization',
			fields,
			actions: [
				{
					label: 'Create',
					key: 'create',
					class: 'btn-primary',
					buttonType: 'submit',
					callback: ({ fieldValues, close }) => {
						$mutationChargeAuthorizationCreate.mutate({
							chargerId: parseInt(fieldValues.chargerId),
							connectorId: parseInt(fieldValues.connectorId) || null,
							expiryDate: fieldValues.expiryDate ? new Date(fieldValues.expiryDate) : null,
							rfidTagId: parseInt(fieldValues.rfidTagId) || null,
							wLimit: fieldValues.wLimit || null
						});
						close();
					}
				}
			]
		} as const satisfies DrawerState<typeof fields>;

		drawerStore.open(drawerContent);
	};

	const openEditDrawer = (auth: {
		id: number;
		chargerId: number;
		connectorId: number | null;
		expiryDate: string | null;
		rfidTagId: number | null;
		wLimit: number | null;
	}) => {
		const fields = [
			{
				label: 'Charger ID',
				name: 'chargerId',
				type: 'dropdown',
				defaultValue: auth.chargerId.toString(),
				options: $queryChargers.data
					? $queryChargers.data.map((charger) => ({
							label: `${charger.friendlyName} (${charger.vendor})`,
							value: charger.id.toString()
						}))
					: [],
				validation: z.string().min(1),
				onChange: async (value) => {
					if (!value) return;
					const connectors = await hClient.connector.charger[':id']
						.$get({ param: { id: value } })
						.then((res) => res.json());

					drawerStore.overwriteDeep((state) => {
						const connectorField = state.fields.find((field) => field.name === 'connectorId');
						if (!connectorField || connectorField.type !== 'dropdown') return;

						connectorField.options = [
							{ label: 'All', value: '' },
							...connectors.map((connector) => ({
								label: connector.id.toString(),
								value: connector.id.toString()
							}))
						];

						return state;
					});
				}
			},
			{
				label: 'Connector ID',
				name: 'connectorId',
				type: 'dropdown',
				defaultValue: auth.connectorId?.toString() || '',
				options: [], // Populated dynamically on Charger ID change
				validation: z.string()
			},
			{
				label: 'Expiry Date',
				name: 'expiryDate',
				type: 'date',
				defaultValue: auth.expiryDate || '',
				validation: z.string()
			},
			{
				label: 'RFID Tag ID',
				name: 'rfidTagId',
				type: 'dropdown',
				defaultValue: auth.rfidTagId?.toString() || '',
				options: $queryRfidTags.data
					? $queryRfidTags.data.map((tag) => ({
							label: `${tag.friendlyName} (${tag.rfidTag})`,
							value: tag.id.toString()
						}))
					: [],
				validation: z.string().min(1)
			},
			{
				label: 'Watt Limit',
				name: 'wLimit',
				type: 'number',
				defaultValue: auth.wLimit || undefined,
				validation: z.coerce.number().nullable()
			}
		] as const satisfies Field[];

		const drawerContent = {
			header: 'Edit Charge Authorization',
			fields,
			actions: [
				{
					label: 'Save',
					key: 'save',
					class: 'btn-primary',
					buttonType: 'submit',
					callback: ({ fieldValues, close }) => {
						$mutationChargeAuthorizationUpdate.mutate({
							id: auth.id,
							chargerId: parseInt(fieldValues.chargerId),
							connectorId: fieldValues.connectorId ? parseInt(fieldValues.connectorId) : null,
							expiryDate: fieldValues.expiryDate ? new Date(fieldValues.expiryDate) : null,
							rfidTagId: parseInt(fieldValues.rfidTagId) || null,
							wLimit: fieldValues.wLimit ? Number(fieldValues.wLimit) : null
						});
						close();
					}
				},
				{
					label: 'Cancel',
					key: 'cancel',
					class: 'btn-outline',
					callback: ({ close }) => {
						close();
					}
				},
				{
					label: 'Delete',
					key: 'delete',
					class: 'btn-error btn-outline',
					buttonType: 'button',
					callback: ({ close }) => {
						$mutationChargeAuthorizationDelete.mutate({ id: auth.id });
						close();
					}
				}
			]
		} as const satisfies DrawerState<typeof fields>;

		drawerStore.open(drawerContent);

		// Preload connector options based on the current chargerId
		fields.find((field) => field.name === 'chargerId')?.onChange?.(auth.chargerId.toString());
	};
</script>

<BasePage title="Charge Authorizations">
	<div class="container mx-auto px-4">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Charge Authorizations</h1>
			<button
				class="btn btn-primary"
				disabled={$queryChargers.isPending || $queryRfidTags.isPending}
				onclick={openCreateDrawer}
			>
				Add Charge Authorization
			</button>
		</div>

		<Scrollable class="p-4" maxHeight="80svh">
			<div class="space-y-6">
				{#if $queryChargeAuthorizations.data}
					{#each $queryChargeAuthorizations.data as auth}
						{@const tag = $queryRfidTags.data?.find((tag) => tag.id === auth.rfidTagId)}
						{@const charger = $queryChargers.data?.find((charger) => charger.id === auth.chargerId)}
						<div class="bg-base-200 rounded-lg p-6 shadow-md">
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<IconLockPin class="text-primary h-10 w-10" />
									<div>
										<h3 class="text-xl font-semibold">Charger ID: {auth.chargerId}</h3>
										<p class="text-sm text-gray-500">Connector ID: {auth.connectorId ?? 'N/A'}</p>
									</div>
								</div>
								<button class="btn btn-ghost btn-sm" onclick={() => openEditDrawer(auth)}
									>Edit</button
								>
							</div>
							<table class="bg-base-300 mt-4 table w-full overflow-hidden rounded-lg">
								<tbody>
									<tr>
										<td class="w-60 font-medium">Charging Station</td>
										<td>{charger?.friendlyName} ({charger?.vendor})</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Connector Id</td>
										<td>Connector: {auth.connectorId || 'All'}</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">RFID Tag</td>
										<td>{tag?.friendlyName} ({tag?.rfidTag})</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Expiry Date</td>
										<td
											>{auth.expiryDate
												? formatDistanceToNow(new Date(auth.expiryDate), { addSuffix: true })
												: 'N/A'}</td
										>
									</tr>
									<tr>
										<td class="w-60 font-medium">Watt Limit</td>
										<td>{auth.wLimit ? `${auth.wLimit} W` : 'No limit'}</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Created</td>
										<td>{formatDistanceToNow(new Date(auth.createdAt), { addSuffix: true })}</td>
									</tr>
								</tbody>
							</table>
						</div>
					{/each}
				{:else}
					<div class="bg-base-200 rounded-lg p-8 text-center">
						<p class="text-base-content">Loading Charge Authorizations...</p>
					</div>
				{/if}
			</div>
		</Scrollable>
	</div>
</BasePage>
