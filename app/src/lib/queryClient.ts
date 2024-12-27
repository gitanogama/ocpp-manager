import { createMutation, createQuery, QueryClient } from '@tanstack/svelte-query';
import { hClient } from './hClient';

export const queryClient = new QueryClient();

export const queryKeys = {
	charger: ['charger'],
	log: ['log'],
	setting: ['setting'],
	connector: (key: string) => ['connector', key],
	rfidTag: ['rfid-tag'],
	chargeAuthorization: ['charge-authorization']
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
		mutationFn: ({
			friendlyName,
			expiryDate,
			rfidTag,
			wLimit
		}: {
			friendlyName: string;
			expiryDate?: Date | null;
			rfidTag: string;
			wLimit?: number | null;
		}) =>
			hClient['rfid-tag']
				.$post({
					json: {
						friendlyName,
						expiryDate: expiryDate || null,
						rfidTag,
						wLimit: wLimit ?? null
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
			expiryDate,
			rfidTag,
			wLimit
		}: {
			id: number;
			friendlyName: string;
			expiryDate: Date | null;
			rfidTag?: string;
			wLimit: number | null;
		}) =>
			hClient['rfid-tag'][':id']
				.$patch({
					param: { id: id.toString() },
					json: {
						friendlyName,
						expiryDate,
						rfidTag,
						wLimit
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
		queryKey: queryKeys.connector(chargerId),
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
			connectorId,
			expiryDate,
			rfidTagId,
			wLimit
		}: {
			chargerId: number;
			connectorId: number | null;
			expiryDate: Date | null;
			rfidTagId: number | null;
			wLimit: number | null;
		}) =>
			hClient['charge-authorization']
				.$post({
					json: {
						chargerId,
						connectorId,
						expiryDate,
						rfidTagId,
						wLimit
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
			connectorId,
			expiryDate,
			rfidTagId,
			wLimit
		}: {
			id: number;
			chargerId: number;
			connectorId: number | null;
			expiryDate: Date | null;
			rfidTagId: number | null;
			wLimit: number | null;
		}) =>
			hClient['charge-authorization'][':id']
				.$patch({
					param: { id: id.toString() },
					json: {
						chargerId,
						connectorId,
						expiryDate,
						rfidTagId,
						wLimit
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
