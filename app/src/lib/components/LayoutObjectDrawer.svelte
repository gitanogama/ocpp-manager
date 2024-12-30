<script lang="ts">
	import {
		drawerStore,
		type Action,
		type DrawerState,
		type Field,
		type FieldValues
	} from '$lib/drawerStore';
	import { onMount } from 'svelte';
	import { z } from 'zod';

	let inputDrawerToggle: HTMLInputElement;
	let drawer = $state<DrawerState<readonly Field[]> | null>(null);
	let fieldValues = $state<Record<string, any>>({});
	let fieldErrors = $state<Record<string, string | undefined>>({});

	// Helper function for converting UTC to local datetime
	const convertUTCToLocal = (utcDateTime?: string | null): string | null | undefined => {
		if (!utcDateTime) return utcDateTime;
		if (!utcDateTime.endsWith('Z')) return utcDateTime;

		const utcDate = new Date(utcDateTime);
		const localDate = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000);
		return localDate.toISOString().slice(0, 16);
	};

	// Helper function for converting local datetime to UTC
	const convertLocalToUTC = (localDateTime?: string | null): string | null | undefined => {
		if (!localDateTime) return localDateTime;
		if (localDateTime.endsWith('Z')) return localDateTime;

		const localDate = new Date(localDateTime);
		const utcDate = new Date(localDate.getTime() + localDate.getTimezoneOffset() * 60000);
		return utcDate.toISOString();
	};

	const validateField = (field: Field, value: any): string | undefined => {
		if (!field.validation) return undefined;

		try {
			field.validation.parse(value);
			return undefined;
		} catch (error) {
			if (error instanceof z.ZodError) {
				return error.errors[0]?.message;
			}
			return 'Invalid value';
		}
	};

	const handleAction = (action: Action<any>) => {
		if (!drawer) return;

		fieldErrors = {};

		if (action.buttonType === 'submit') {
			let hasErrors = false;

			drawer.fields.forEach((field) => {
				const error = validateField(field, fieldValues[field.name]);
				if (error) {
					fieldErrors[field.name] = error;
					hasErrors = true;
				}
			});

			if (hasErrors) {
				return;
			}
		}

		action.callback({
			fieldValues: fieldValues as FieldValues<typeof drawer.fields>,
			closeDrawer: () => drawerStore.close()
		});
	};

	const initializeFieldValues = (state: DrawerState<readonly Field[]>) => {
		fieldValues = state.fields.reduce(
			(acc, field) => {
				let value: any;

				if (field.defaultValue !== undefined) {
					if (field.type === 'date') {
						value = convertUTCToLocal(field.defaultValue);
					} else {
						value = field.defaultValue;
					}
				} else if (field.type === 'checkbox') {
					value = false;
				} else if (field.type === 'dropdown') {
					value = field.options[0]?.value || '';
				} else if (field.type === 'number') {
					value = 0;
				} else {
					value = '';
				}

				acc[field.name] = value;
				return acc;
			},
			{} as Record<string, any>
		);

		state.fields.forEach((field) => {
			const value = fieldValues[field.name];
			handleFieldChange(field, value);
		});
	};

	onMount(() => {
		const unsubscribe = drawerStore.subscribe((state) => {
			const lastDrawerStateOpen = inputDrawerToggle.checked;
			drawer = state;
			if (drawer && !lastDrawerStateOpen) {
				initializeFieldValues(drawer);
				fieldErrors = {};
			}
			inputDrawerToggle.checked = !!drawer;
		});

		return () => {
			unsubscribe();
		};
	});

	const handleFieldChange = (field: Field, value: any) => {
		if (!field.onChange) return;

		switch (field.type) {
			case 'number':
				return field.onChange(value as number);
			case 'text':
				return field.onChange(value as string);
			case 'checkbox':
				return field.onChange(value as boolean);
			case 'dropdown':
				return field.onChange(value as string);
			case 'date':
				if (typeof value === 'string') {
					return field.onChange(convertLocalToUTC(value) || null);
				}
				return;
		}
	};
</script>

<div class="drawer drawer-end">
	<input id="object-drawer" bind:this={inputDrawerToggle} type="checkbox" class="drawer-toggle" />
	<div class="drawer-side">
		<label for="object-drawer" class="drawer-overlay"></label>
		{#if drawer}
			<form
				class="menu bg-base-200 text-base-content min-h-full w-[30rem] p-4"
				onsubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					const submitAction = drawer?.actions.find((a) => a.buttonType === 'submit');
					if (submitAction) handleAction(submitAction);
				}}
			>
				<h2 class="text-lg font-bold">{drawer.header}</h2>

				<div class="my-4 space-y-4">
					{#each drawer.fields as field, index}
						<div class="form-control">
							<label for={`field-${index}`} class="label">
								<span class="label-text">{field.label}</span>
							</label>

							{#if field.type === 'text' || field.type === 'number'}
								<input
									id={`field-${index}`}
									type={field.type}
									class={`input input-bordered ${field.class || ''} ${
										fieldErrors[field.name] ? 'input-error' : ''
									}`}
									bind:value={fieldValues[field.name]}
									oninput={() => {
										handleFieldChange(field, fieldValues[field.name]);
										const error = validateField(field, fieldValues[field.name]);
										fieldErrors[field.name] = error;
									}}
								/>
							{:else if field.type === 'checkbox'}
								<input
									id={`field-${index}`}
									type="checkbox"
									class={`checkbox ${field.class || ''} ${
										fieldErrors[field.name] ? 'checkbox-error' : ''
									}`}
									bind:checked={fieldValues[field.name]}
									onchange={() => {
										handleFieldChange(field, fieldValues[field.name]);
										const error = validateField(field, fieldValues[field.name]);
										fieldErrors[field.name] = error;
									}}
								/>
							{:else if field.type === 'dropdown'}
								<select
									id={`field-${index}`}
									class={`select select-bordered ${field.class || ''} ${
										fieldErrors[field.name] ? 'select-error' : ''
									}`}
									bind:value={fieldValues[field.name]}
									onchange={() => {
										handleFieldChange(field, fieldValues[field.name]);
										const error = validateField(field, fieldValues[field.name]);
										fieldErrors[field.name] = error;
									}}
								>
									{#each field.options as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							{:else if field.type === 'date'}
								<input
									id={`field-${index}`}
									type="datetime-local"
									class={`input input-bordered ${field.class || ''} ${
										fieldErrors[field.name] ? 'input-error' : ''
									}`}
									bind:value={fieldValues[field.name]}
									onchange={() => {
										handleFieldChange(field, fieldValues[field.name]);
										const error = validateField(field, fieldValues[field.name]);
										fieldErrors[field.name] = error;
									}}
								/>
							{/if}

							{#if fieldErrors[field.name]}
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="label">
									<span class="label-text-alt text-error">{fieldErrors[field.name]}</span>
								</label>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-4 flex space-x-2">
					{#each drawer.actions as action}
						<button
							type={action.buttonType}
							class="btn {action.class || ''}"
							onclick={() => {
								if (action.buttonType !== 'submit') handleAction(action);
							}}
						>
							{action.label}
						</button>
					{/each}
				</div>
			</form>
		{/if}
	</div>
</div>
