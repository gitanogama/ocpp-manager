<script lang="ts">
	import '../app.css';
	import IconAdjustments from '$lib/icons/tabler/IconAdjustments.svelte';
	import IconInvoice from '$lib/icons/tabler/IconInvoice.svelte';
	import IconUniverse from '$lib/icons/tabler/IconUniverse.svelte';
	import Logo from '$lib/media/Logo.svelte';
	import IconChevronLeft from '$lib/icons/tabler/IconChevronLeft.svelte';
	import IconChevronRight from '$lib/icons/tabler/IconChevronRight.svelte';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import IconLogs from '$lib/icons/tabler/IconLogs.svelte';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { queryClient } from '$lib/queryClient';
	import { hClient } from '$lib/hClient';

	let { children } = $props();
	let time = $state(new Date());
	let isSidebarMinimized = $state(false);
	let loaded = $state(false);
	const isSidebarMinimizedLocalStorageKey = 'isSidebarMinimized';

	$effect(() => {
		const interval = setInterval(() => {
			time = new Date();
		}, 1000);

		return () => clearInterval(interval);
	});

	onMount(() => {
		const savedState = localStorage.getItem(isSidebarMinimizedLocalStorageKey);
		if (savedState !== null) {
			isSidebarMinimized = JSON.parse(savedState);
		}
		loaded = true;
	});

	$effect(() => {
		localStorage.setItem(isSidebarMinimizedLocalStorageKey, JSON.stringify(isSidebarMinimized));
	});

	function isActiveRoute(href: string): boolean {
		return $page.url.pathname === href;
	}

	function toggleSidebar() {
		isSidebarMinimized = !isSidebarMinimized;
	}
</script>

<QueryClientProvider client={queryClient}>
	<div class="bg-base-100 flex h-screen">
		<!-- Sidebar -->
		{#if loaded}
			<aside
				class={`${
					isSidebarMinimized ? 'w-36' : 'w-96'
				} bg-base-200 text-base-content transition-width flex-shrink-0 duration-300`}
			>
				<div class="flex h-full flex-col p-4">
					<div class="relative">
						<button
							onclick={toggleSidebar}
							class="bg-base-200 border-base-content absolute -right-8 top-0 flex items-center justify-center rounded-full border-2 p-1"
						>
							{#if isSidebarMinimized}
								<IconChevronRight class="text-base-content size-6" />
							{:else}
								<IconChevronLeft class="text-base-content size-6" />
							{/if}
						</button>
					</div>

					<ul class="menu flex flex-col space-y-4">
						<li class="mb-10">
							<a
								href="/"
								class:btn-active={isActiveRoute('/')}
								class:justify-center={isSidebarMinimized}
								class="item flex items-center text-lg font-bold"
							>
								<Logo class="size-10" />

								<p class:hidden={isSidebarMinimized} class="ml-4 text-nowrap">OCPP Manager</p>
							</a>
						</li>
						<li>
							<a
								href="/monitoring"
								class:btn-active={isActiveRoute('/monitoring')}
								class:justify-center={isSidebarMinimized}
								class="item flex items-center text-lg font-bold"
							>
								<IconUniverse class=" size-10" />

								<p class:hidden={isSidebarMinimized} class="ml-4 text-nowrap">Monitoring</p>
							</a>
						</li>
						<li>
							<a
								href="/invoices"
								class:btn-active={isActiveRoute('/invoices')}
								class:justify-center={isSidebarMinimized}
								class="item flex items-center text-lg font-bold"
							>
								<IconInvoice class="size-10" />

								<p class:hidden={isSidebarMinimized} class="ml-4 text-nowrap">Invoices</p>
							</a>
						</li>
						<li>
							<a
								href="/administration"
								class:btn-active={isActiveRoute('/administration')}
								class:justify-center={isSidebarMinimized}
								class="item flex items-center text-lg font-bold"
							>
								<IconAdjustments class="size-10" />
								<p class:hidden={isSidebarMinimized} class="ml-4 text-nowrap">Administration</p>
							</a>
						</li>
						<li>
							<a
								href="/logs"
								class:btn-active={isActiveRoute('/logs')}
								class:justify-center={isSidebarMinimized}
								class="item flex items-center text-lg font-bold"
							>
								<IconLogs class="size-10" />
								<p class:hidden={isSidebarMinimized} class="ml-4 text-nowrap">Logs</p>
							</a>
						</li>
					</ul>
				</div>
			</aside>

			<!-- Main Content -->
			<div class="flex flex-1 flex-col">
				<main class="bg-base-100 flex-1 p-8">
					{@render children()}
				</main>

				<footer class="bg-base-200 p-4 text-center text-sm">
					<p>{time.toLocaleTimeString()}</p>
				</footer>
			</div>
		{/if}
	</div>
</QueryClientProvider>
