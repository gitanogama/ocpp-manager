import { createMutation, createQuery, QueryClient } from '@tanstack/svelte-query';
import { hClient } from './hClient';

export const queryClient = new QueryClient();

export const queryKeys = {
	chargers: ['chargers'],
	logs: ['logs']
};

export const createQueryChargers = () =>
	createQuery({
		queryKey: queryKeys.chargers,
		queryFn: () => hClient.chargers.$get().then((x) => x.json())
	});

export const createMutationChargerStatus = () =>
	createMutation({
		mutationFn: ({
			id,
			status
		}: {
			id: string;
			status: 'Accepted' | 'Pending' | 'Rejected' | 'Disabled';
		}) =>
			hClient.chargers[':id']
				.$patch({
					param: { id },
					json: { status }
				})
				.then((x) => x.json()),
		onSuccess() {
			queryClient.invalidateQueries({
				queryKey: queryKeys.chargers
			});
		}
	});

export const createQueryLogs = (refetchInterval: number, maxLines: number) =>
	createQuery({
		queryKey: [...queryKeys.logs, maxLines],
		refetchInterval,
		queryFn: ({ queryKey }) => {
			const [, maxLines] = queryKey;
			return hClient.logs.stream
				.$get({
					query: {
						maxLines: maxLines.toString()
					}
				})
				.then((x) => x.text())
				.then((x) => x.split('\n'));
		}
	});
