<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import Errors from './Errors.svelte';
	import Button from './Button.svelte';

	export let id = null;
	export let submitLabel = 'Submit';
	export let processingLabel = 'Sending...';
	export let horizontalForm = false; // toggles display to horizontal; presumes fewer inputs
	export let includeActions = true;
	export let fullWidthActions = false;
	export let tertiaryAction = false;
	export let tertiaryActionType = 'href'; // handler, href
	export let tertiaryActionLabel = 'Return to Home';
	export let tertiaryActionLink = '/';
	export let reverseActionsOrder = horizontalForm ? true : false;
	export let actionsButtonSize = horizontalForm ? 'inline' : 'standard';
	export let actionsClasses = '';
	export let resettable = false;
	export let resetLabel = 'Reset';
	export let dismissible = false;
	export let dismissLabel = 'Cancel';
	export let dismissHandler = () => {};
	export let submitHandler = () => {};
	export let formClasses = '';
	export let htmlFormValidation = false; // this is disabled by default to display custom error messages
	export let isSubmitting = false;
	export let danger = false; // flag to update styling to reflect when form action is destructive
	export let formLevelErrors = null;
	export let isValid = false; // 'formValid' and 'formInvalid' events can be listened to on component instances

	let thisForm;
	let formElements;
	const dispatch = createEventDispatcher();

	onMount(() => {
		// gather form elements
		formElements = Array.from(thisForm.elements).filter((el) => el.matches('input, select, textarea'));
		checkValidity();
		// add listener when elements are added to the DOM
		formElements?.forEach((el) => el.addEventListener('input', checkValidity, false));
		// remove listener when elements are removed from the DOM
		return () => formElements?.forEach((el) => el.removeEventListener('input', checkValidity, false));
	});

	function checkValidity() {
		let formState = [];
		formElements?.forEach((input) => formState.push(input.validity.valid));
		isValid = !formState.includes(false);
		isValid ? dispatch('formValid') : dispatch('formInvalid');
	}

	async function submitHandlerWrapper() {
		isSubmitting = true;
		await submitHandler();
		isSubmitting = false;
	}
</script>

<form
	bind:this={thisForm}
	{id}
	class="m-0 {horizontalForm ? 'flex space-x-4' : 'space-y-4'} {formClasses}"
	novalidate={!htmlFormValidation}
	on:submit|preventDefault={submitHandlerWrapper}
	on:reset
	{...$$restProps}
>
	<div class="mb-6">
		<slot name="preface" />
	</div>
	<Errors errors={formLevelErrors} formError={true} />
	<slot />

	{#if includeActions}
		<slot name="actions">
			<div
				class="flex {horizontalForm ? 'space-x-2 items-start' : 'pt-3 space-x-3'}
				{reverseActionsOrder ? 'flex-row-reverse space-x-reverse' : ''} {actionsClasses}"
			>
				<Button
					label={!isSubmitting ? submitLabel : processingLabel}
					type="submit"
					size={actionsButtonSize}
					naturalWidth={fullWidthActions ? false : true}
					disabled={!isValid || isSubmitting}
					{danger}
				/>
				{#if resettable}
					<Button label={resetLabel} level="secondary" type="reset" size={actionsButtonSize} naturalWidth={fullWidthActions ? false : true} />
				{/if}
				{#if dismissible}
					<Button label={dismissLabel} level="secondary" size={actionsButtonSize} naturalWidth={fullWidthActions ? false : true} on:click={dismissHandler} />
				{/if}
			</div>
			{#if tertiaryAction}
				<p class='mt-5 max-w font-medium text-center text-gray-600'>
					{#if tertiaryActionType === 'href'}
						<a href='{tertiaryActionLink}' class='hover_text-action-hover cursor-pointer'>{tertiaryActionLabel}</a> 
						{:else}
						<span class='hover_text-action-hover cursor-pointer' on:click='{tertiaryActionLink}'>{tertiaryActionLabel}</span> 
					{/if}
				</p>
			{/if}
		</slot>
	{/if}
</form>
