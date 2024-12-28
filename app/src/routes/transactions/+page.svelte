<script lang="ts">
	import { createQueryTransactions, createMutationTransactionDelete } from '$lib/queryClient';
	import { formatDistanceToNow } from 'date-fns';
	import BasePage from '$lib/components/BasePage.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';

	const queryTransactions = createQueryTransactions(10000);
	const mutationTransactionDelete = createMutationTransactionDelete();

	const deleteTransaction = (id: number) => {
		$mutationTransactionDelete.mutate({ id });
	};
</script>

<BasePage title="Transactions">
	<div class="container mx-auto px-4">
		<Scrollable class="p-4" maxHeight="80svh">
			<div class="space-y-6">
				{#if $queryTransactions.data}
					{#each $queryTransactions.data as transaction}
						<div class="bg-base-200 rounded-lg p-6 shadow-md">
							<div class="mb-6 flex items-center justify-between">
								<div>
									<h3 class="text-xl font-semibold">
										Transaction ID: {transaction.id}
									</h3>
									<p class="text-sm text-gray-500">
										Status: {transaction.status}
									</p>
								</div>
								<button
									class="btn btn-ghost btn-sm"
									onclick={() => deleteTransaction(transaction.id)}
								>
									Delete
								</button>
							</div>

							<table class="bg-base-300 table w-full overflow-hidden rounded-lg">
								<tbody>
									<tr>
										<td class="w-60 font-medium">Connector ID</td>
										<td>{transaction.connectorId}</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Start Time</td>
										<td>
											{formatDistanceToNow(new Date(transaction.startTime), { addSuffix: true })}
										</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">End Time</td>
										<td>
											{transaction.stopTime
												? formatDistanceToNow(new Date(transaction.stopTime), { addSuffix: true })
												: 'In Progress'}
										</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Energy Delivered</td>
										<td>{transaction.energyDelivered ?? 'N/A'} kWh</td>
									</tr>
								</tbody>
							</table>
						</div>
					{/each}
				{:else}
					<div class="bg-base-200 rounded-lg p-8 text-center">
						<p class="text-base-content">Loading Transactions...</p>
					</div>
				{/if}
			</div>
		</Scrollable>
	</div>
</BasePage>
