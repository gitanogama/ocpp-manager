import { createMutation, createQuery, QueryClient } from '@tanstack/svelte-query';
import { hClient } from './hClient';

export const queryClient = new QueryClient();

export const queryKeys = {
	charger: ['charger'],
	log: ['log'],
	setting: ['setting'],
	connectorByid: (connectorId: string) => ['connector', connectorId],
	rfidTag: ['rfid-tag'],
	chargeAuthorization: ['charge-authorization'],
	transaction: ['transaction'],
	transactionByCharger: (chargerId: number) => ['transaction', 'charger', chargerId],
	transactionByConnector: (connectorId: number) => ['transaction', 'connector', connectorId],
	transactionById: (id: number) => ['transaction', 'id', id]
};

export const createQueryRfidTag = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.rfidTag,
		queryFn: () => hClient['rfid-tag'].$get().then((x) => x.json())
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
				queryKey: queryKeys.rfidTag
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
				queryKey: queryKeys.rfidTag
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
				queryKey: queryKeys.rfidTag
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
		queryKey: queryKeys.connectorByid(chargerId),
		queryFn: () =>
			hClient.connector.charger[':id']
				.$get({
					param: {
						id: chargerId
					}
				})
				.then((x) => x.json())
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

export const createQueryChargeAuthorization = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.chargeAuthorization,
		queryFn: () => hClient['charge-authorization'].$get().then((x) => x.json())
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

// Transaction Queries and Mutations
export const createQueryTransactions = (refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transaction,
		queryFn: () => hClient.transaction.$get().then((x) => x.json())
	});

export const createQueryTransactionById = (id: number, refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionById(id),
		queryFn: () =>
			hClient.transaction[':id']
				.$get({
					param: { id: id.toString() }
				})
				.then((x) => x.json())
	});

export const createQueryTransactionsByCharger = (chargerId: number, refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionByCharger(chargerId),
		queryFn: () =>
			hClient.transaction.charger[':chargerId']
				.$get({
					param: { chargerId: chargerId.toString() }
				})
				.then((x) => x.json())
	});

export const createQueryTransactionsByConnector = (connectorId: number, refetchInterval?: number) =>
	createQuery({
		refetchInterval,
		queryKey: queryKeys.transactionByConnector(connectorId),
		queryFn: () =>
			hClient.transaction.connector[':connectorId']
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
				queryKey: queryKeys.transaction
			});
		}
	});
