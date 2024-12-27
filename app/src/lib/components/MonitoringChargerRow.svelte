<script lang="ts">
	import {
		createMutationChargerDelete,
		createMutationChargerUpdate,
		createQueryConnector
	} from '$lib/queryClient';
	import { drawerStore } from '$lib/drawerStore';
	import { z } from 'zod';
	import type { InferResponseType } from 'hono';
	import type { hClient } from '$lib/hClient';
	import IconChargingPile from '$lib/icons/tabler/IconChargingPile.svelte';
	import { formatDistanceToNow } from 'date-fns';
	import IconPlug from '$lib/icons/tabler/IconPlug.svelte';

	const { charger }: { charger: InferResponseType<(typeof hClient)['charger']['$get']>[0] } =
		$props();

	const queryConnectors = createQueryConnector(charger.id.toString(), 10000);

	const mutationChargerUpdate = createMutationChargerUpdate();
	const mutationChargerDelete = createMutationChargerDelete();

	const openEditDrawer = () => {
		drawerStore.open({
			header: 'Edit Charger',
			fields: [
				{
					label: 'Friendly Name',
					name: 'friendlyName',
					type: 'text',
					defaultValue: charger.friendlyName || '',
					validation: z.string().min(1, { message: 'Please enter a friendly name.' })
				},
				{
					label: 'Shortcode',
					name: 'shortcode',
					type: 'text',
					defaultValue: charger.shortcode || '',
					validation: z
						.string()
						.regex(/^[a-z0-9-]+$/, {
							message:
								'Only lowercase letters, numbers, and dashes are allowed (no spaces or other characters).'
						})
						.min(5, { message: 'Minimum length is 5 characters.' })
						.max(30, { message: 'Maximum length is 30 characters.' })
				},
				{
					label: 'Status',
					name: 'status',
					type: 'dropdown',
					options: [
						{ label: 'Pending', value: 'Pending' },
						{ label: 'Accepted', value: 'Accepted' },
						{ label: 'Rejected', value: 'Rejected' }
					],
					defaultValue: charger.status || 'Pending',
					validation: z.enum(['Pending', 'Accepted', 'Rejected'])
				}
			] as const,
			actions: [
				{
					label: 'Save',
					key: 'save',
					class: 'btn-primary',
					buttonType: 'submit',
					callback: ({ fieldValues, close }) => {
						$mutationChargerUpdate.mutate({
							id: charger.id.toString(),
							friendlyName: fieldValues.friendlyName,
							status: fieldValues.status as any,
							shortcode: fieldValues.shortcode
						});
						close();
					}
				},
				{
					label: 'Cancel',
					key: 'cancel',
					class: 'btn-outline',
					callback: ({ fieldValues, close }) => {
						close();
					}
				},
				{
					label: 'Delete',
					key: 'delete',
					class: 'btn-error btn-outline',
					buttonType: 'button',
					callback: ({ fieldValues, close }) => {
						$mutationChargerDelete.mutate({ id: charger.id.toString() });
						close();
					}
				}
			]
		});
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
</script>

<div class="bg-base-200 container mx-auto rounded-lg px-4 py-6 shadow-md">
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
		<button class="btn btn-ghost btn-sm" onclick={openEditDrawer}> Edit </button>
	</div>

	<div class="mb-6">
		<span
			class="badge badge-lg badge-outline p-3"
			class:badge-warning={charger.status === 'Pending'}
			class:badge-success={charger.status === 'Accepted'}
		>
			{charger.status || 'Unknown'}
		</span>
	</div>

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

	<div class="mt-6">
		<h3 class="mb-4 text-xl font-bold">Connectors</h3>
		<div class="space-y-4">
			{#if $queryConnectors.data}
				{#each $queryConnectors.data as connector}
					<button
						class="bg-base-300 hover:bg-base-100 flex w-full items-center justify-between rounded-lg p-4 shadow-md"
					>
						<div class="flex items-center gap-4">
							<IconPlug class="h-6 w-6 text-current" />
							<div class="flex flex-col text-left">
								<span class="font-bold">Connector {connector.connectorId}</span>
								<span class="text-sm">Max Current: {connector.maxCurrent}A</span>
								{#if connector.errorCode}
									<p class="text-error mt-1 text-sm">Error: {connector.errorCode}</p>
								{/if}
							</div>
						</div>
						<div class="flex items-center gap-4">
							<p class="text-sm font-medium">{connector.status}</p>
							<div class={`h-2 w-16 rounded-full ${getStatusColor(connector.status)}`}></div>
						</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>
</div>
