<script lang="ts">
	import BasePage from '$lib/components/BasePage.svelte';
	import { createMutationChargerCreate, createQueryCharger } from '$lib/queryClient';
	import MonitoringChargerRow from '$lib/components/MonitoringChargerRow.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';
	import { drawerStore } from '$lib/drawerStore';
	import { z } from 'zod';
	import { toast } from 'svelte-daisy-toast';

	const queryChargers = createQueryCharger(10000);

	const mutationChargerCreate = createMutationChargerCreate();

	const openCreateDrawer = () => {
		drawerStore.open({
			header: 'Add Charger',
			fields: [
				{
					label: 'Label',
					name: 'label',
					type: 'text',
					defaultValue: '',
					validation: z.string().min(1)
				},
				{
					label: 'Shortcode',
					name: 'shortcode',
					type: 'text',
					defaultValue: 'your-shortcode',
					validation: z
						.string()
						.regex(/^[a-z0-9-]+$/, {
							message:
								'Only lowercase letters, numbers, and dashes are allowed (no spaces or other characters).'
						})
						.min(5, { message: 'Minimum length is 5 characters.' })
						.max(30, { message: 'Maximum length is 30 characters.' })
				}
			] as const,
			actions: [
				{
					label: 'Create',
					key: 'create',
					class: 'btn-primary',
					buttonType: 'submit',
					callback: ({ fieldValues, close }) => {
						$mutationChargerCreate.mutate(
							{ friendlyName: fieldValues.label, shortcode: fieldValues.shortcode },
							{
								onError: () => {
									toast({
										message: 'Error creating charger',
										type: 'error'
									});
								},
								onSuccess: () => {
									toast({
										message: 'Charger created',
										type: 'success'
									});
									close();
								}
							}
						);
					}
				}
			]
		});
	};
</script>

<BasePage title="Monitoring">
	<div class="container mx-auto px-4">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-2xl font-bold">Chargers</h1>
			<button class="btn btn-primary" onclick={openCreateDrawer}>Add Charger</button>
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
