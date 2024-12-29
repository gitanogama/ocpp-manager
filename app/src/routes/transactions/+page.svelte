<script lang="ts">
	import { createQueryTransactionsDetail, createMutationTransactionDelete } from '$lib/queryClient';

	import BasePage from '$lib/components/BasePage.svelte';
	import Scrollable from '$lib/components/Scrollable.svelte';
	import { formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

	function getFormattedDuration(start: string, end: string | null) {
		if (!end) return 'N/A';
		const duration = intervalToDuration({ start: new Date(start), end: new Date(end) });
		return formatDuration(duration);
	}

	const queryTransactions = createQueryTransactionsDetail(10000);
	const mutationTransactionDelete = createMutationTransactionDelete();

	const deleteTransaction = (id: number) => {
		$mutationTransactionDelete.mutate({ id });
	};
</script>

<BasePage title="Transactions">
	<div class="container mx-auto px-4">
		<Scrollable class="p-4" maxHeight="80svh">
			<div class="space-y-6">
				{#if $queryTransactions.data && $queryTransactions.data.length > 0}
					{#each $queryTransactions.data as transaction}
						<div class="bg-base-200 rounded-lg p-6 shadow-md">
							<div class="mb-4 flex items-center justify-between">
								<div>
									<h3 class="text-xl font-semibold">
										Transaction #{transaction.id}
									</h3>
									<p class="text-sm text-gray-500">
										Status: <span class="font-bold">{transaction.status}</span>
									</p>
								</div>
								<button
									class="btn btn-ghost btn-sm"
									on:click={() => deleteTransaction(transaction.id)}
								>
									Delete
								</button>
							</div>

							<table class="bg-base-300 table w-full overflow-hidden rounded-lg">
								<tbody>
									<tr>
										<td class="w-60 font-medium">Charger</td>
										<td>{transaction.chargeAuthorization?.charger?.friendlyName ?? 'Unknown'}</td>
									</tr>

									<tr>
										<td class="w-60 font-medium">Connector</td>
										<td>{transaction.connectorId}</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Tag Used</td>
										<td>{transaction.chargeAuthorization?.tag?.friendlyName ?? 'Unknown'}</td>
									</tr>

									<tr>
										<td class="w-60 font-medium">Duration</td>
										<td>
											{getFormattedDuration(transaction.startTime, transaction?.stopTime)}
										</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Energy Delivered</td>
										<td
											>{transaction.energyDelivered
												? `${transaction.energyDelivered / 1000} kWh`
												: transaction.estimatedEnergyDelivered
													? `Estimated ${transaction.estimatedEnergyDelivered?.total_energy_delivered} kWh ${formatDistanceToNow(transaction.estimatedEnergyDelivered?.last_update_timestamp)}`
													: 'N/A'}</td
										>
									</tr>
									<tr>
										<td class="w-60 font-medium">Reason</td>
										<td>{transaction.reason}</td>
									</tr>
									<tr>
										<td class="w-60 font-medium">Payment Status</td>
										<td>{transaction.paymentStatus}</td>
									</tr>
								</tbody>
							</table>
						</div>
					{/each}
				{:else}
					<div class="bg-base-200 rounded-lg p-8 text-center">
						<p class="text-base-content">No Transactions Found</p>
					</div>
				{/if}
			</div>
		</Scrollable>
	</div>
</BasePage>
