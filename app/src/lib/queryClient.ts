import { createMutation, createQuery, QueryClient } from '@tanstack/svelte-query';
import { hClient } from './hClient';

export const queryClient = new QueryClient();

export const queryKeys = {
	charger: ['charger'],
	log: ['log'],
	setting: ['setting'],
	connectorByidDetail: (connectorId: string) => ['connector-detail', connectorId],
	rfidTagDetail: ['rfid-tag-detail'],
	chargeAuthorization: ['charge-authorization'],
	chargeAuthorizationDetail: ['charge-authorization-detail'],
	transactionDetail: ['transaction-detail'],
	transactionByChargerDetail: (chargerId: number) => ['transaction-detail', 'charger', chargerId],
	transactionByConnectorDetail: (connectorId: number) => [
		'transaction-detail',
		'connector',
		connectorId
	],
	transactionByIdDetail: (id: number) => ['transaction-detail', 'id', id]
};

export const createQueryRfidTagDetail = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.rfidTagDetail,
		queryFn: () => hClient['rfid-tag'].detail.$get().then((x) => x.json())
	});

export const createMutationRfidTagDelete = () =>
	createMutation({
		mutationFn: ({ id }: { id: number }) =>
			hClient['rfid-tag'][':id']
				.$delete({
					param: { id: id.toString() }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.rfidTagDetail
			});
		}
	});

export const createMutationRfidTagCreate = () =>
	createMutation({
		mutationFn: ({ friendlyName, rfidTag }: { friendlyName: string; rfidTag: string }) =>
			hClient['rfid-tag']
				.$post({
					json: {
						friendlyName,
						rfidTag
					}
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.rfidTagDetail
			});
		}
	});

export const createMutationRfidTagUpdate = () =>
	createMutation({
		mutationFn: ({
			id,
			friendlyName,
			rfidTag
		}: {
			id: number;
			friendlyName: string;
			rfidTag?: string;
		}) =>
			hClient['rfid-tag'][':id']
				.$patch({
					param: { id: id.toString() },
					json: {
						friendlyName,
						rfidTag
					}
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.rfidTagDetail
			});
		}
	});

export const createQueryCharger = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.charger,
		queryFn: () => hClient.charger.$get().then((x) => x.json())
	});

export const createQueryConnector = (chargerId: string, refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.connectorByidDetail(chargerId),
		queryFn: () =>
			hClient.connector.charger[':id'].detail
				.$get({
					param: {
						id: chargerId
					}
				})
				.then((x) => x.json())
	});

export const createMutationConnectorUnlock = () =>
	createMutation({
		mutationFn: ({ id }: { id: string }) =>
			hClient.connector[':id']['unlock-connector']
				.$post({
					param: { id }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.charger
			});
		}
	});

export const createMutationChargerUpdate = () =>
	createMutation({
		mutationFn: ({
			id,
			friendlyName,
			status,
			shortcode
		}: {
			id: string;
			friendlyName: string;
			status: 'Accepted' | 'Rejected' | 'Pending';
			shortcode: string;
		}) =>
			hClient.charger[':id']
				.$patch({
					param: { id },
					json: { status, shortcode, friendlyName }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.charger
			});
		}
	});

export const createMutationChargerDelete = () =>
	createMutation({
		mutationFn: ({ id }: { id: string }) =>
			hClient.charger[':id']
				.$delete({
					param: { id }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.charger
			});
		}
	});

export const createMutationChargerCreate = () =>
	createMutation({
		mutationFn: ({ friendlyName, shortcode }: { friendlyName: string; shortcode: string }) =>
			hClient.charger
				.$post({
					json: { friendlyName, shortcode }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.charger
			});
		}
	});

export const createQueryLog = (refetchInterval: number, maxLines: number) =>
	createQuery({
		queryKey: [...queryKeys.log, maxLines],
		refetchInterval,
		queryFn: ({ queryKey }) => {
			const [, maxLines] = queryKey;
			return hClient.log.stream
				.$get({
					query: {
						maxLines: maxLines.toString()
					}
				})
				.then((x) => x.text())
				.then((x) => x.split('\n'));
		}
	});

export const createQuerySetting = () =>
	createQuery({
		queryKey: queryKeys.setting,
		queryFn: () => hClient.setting.$get().then((x) => x.json())
	});

export const createMutationSetting = () =>
	createMutation({
		mutationFn: ({
			heartbeatInterval,
			systemMaintenance
		}: {
			heartbeatInterval?: number;
			systemMaintenance?: boolean;
		}) =>
			hClient.setting
				.$patch({
					json: { heartbeatInterval, systemMaintenance }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.charger
			});
		}
	});

export const createQueryChargeAuthorizationDetail = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.chargeAuthorizationDetail,
		queryFn: () => hClient['charge-authorization'].detail.$get().then((x) => x.json())
	});

export const createMutationChargeAuthorizationCreate = () =>
	createMutation({
		mutationFn: ({
			chargerId,
			expiryDate,
			rfidTagId
		}: {
			chargerId: number;
			expiryDate: Date | null;
			rfidTagId: number | null;
		}) =>
			hClient['charge-authorization']
				.$post({
					json: {
						chargerId,
						expiryDate,
						rfidTagId
					}
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: ['charge-authorization']
			});
		}
	});

export const createMutationChargeAuthorizationUpdate = () =>
	createMutation({
		mutationFn: ({
			id,
			chargerId,
			expiryDate,
			rfidTagId
		}: {
			id: number;
			chargerId: number;
			expiryDate: Date | null;
			rfidTagId: number | null;
		}) =>
			hClient['charge-authorization'][':id']
				.$patch({
					param: { id: id.toString() },
					json: {
						chargerId,
						expiryDate,
						rfidTagId
					}
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: ['charge-authorization']
			});
		}
	});

export const createMutationChargeAuthorizationDelete = () =>
	createMutation({
		mutationFn: ({ id }: { id: number }) =>
			hClient['charge-authorization'][':id']
				.$delete({
					param: { id: id.toString() }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: ['charge-authorization']
			});
		}
	});

export const createQueryTransactionsDetail = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionDetail,
		queryFn: () => hClient.transaction.detail.$get().then((x) => x.json())
	});

export const createQueryTransactionByIdDetail = (id: number, refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionByIdDetail(id),
		queryFn: () =>
			hClient.transaction[':id'].detail
				.$get({
					param: { id: id.toString() }
				})
				.then((x) => x.json())
	});

export const createQueryTransactionsByChargerDetail = (
	chargerId: number,
	refetchInterval?: number
) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionByChargerDetail(chargerId),
		queryFn: () =>
			hClient.transaction.charger[':chargerId'].detail
				.$get({
					param: { chargerId: chargerId.toString() }
				})
				.then((x) => x.json())
	});

export const createQueryTransactionsByConnectorDetail = (
	connectorId: number,
	refetchInterval?: number
) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionByConnectorDetail(connectorId),
		queryFn: () =>
			hClient.transaction.connector[':connectorId'].detail
				.$get({
					param: { connectorId: connectorId.toString() }
				})
				.then((x) => x.json())
	});

export const createMutationTransactionDelete = () =>
	createMutation({
		mutationFn: ({ id }: { id: number }) =>
			hClient.transaction[':id']
				.$delete({
					param: { id: id.toString() }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.transactionDetail
			});
		}
	});

export const createMutationChargerReset = () =>
	createMutation({
		mutationFn: ({ id, type }: { id: number; type: 'Hard' | 'Soft' }) =>
			hClient['charger'][':id']['reset']
				.$post({
					param: { id: id.toString() },
					json: { type }
				})
				.then((x) => x.json())
	});
