<script>
	// Used to display a data point that has read + edit views
	// Edit views can be:
	// - forms shown inline (usually 1 input)
	// - forms shown in modals
	// - links to elsewhere (either via handler or href)

	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte';
	import { autoFocusFirstChildInput } from '$lib/utils/helpers';
	import { Form, Button } from '$lib/components/forms';
	import Modal from '$lib/components/Modal.svelte';
	import IconWarning from '$lib/components/icons/outline-warning.svelte';

	export let valueLabel = 'Label'; // label for data point
	export let editAction = true; // set to 'false' if only want to show save/cancel after edits are made
	export let editActionLabel = 'Update'; // label for edit call to action (button)
	export let actionType = 'inlineForm'; // inlineForm, modal, handlerOnly, href
	export let action; // can pass a handler function (for inlineForm, modal, handlerOnly type) or href destination
	export let modalHeading = 'Modal Heading';
	export let modalActionLabel = 'Confirm';
	export let alternativeAction = null; // pass actionHandler if want to add a tertiary action link below form buttons
	export let alternativeActionLabel = null; // label of tertiary action link
	export let danger = false; // set true if form will delete (or otherwise irreversibly change) important data
	export let inlineEditingActive = false; // flag to control read + edit state for inline forms
	export let errors = null;

	const dispatch = createEventDispatcher();

	let showModalIcon = $$slots.modalIcon ? true : false;

	// Create unique ID for aria
	let groupName = valueLabel.toLowerCase().replace(' ', '-');
	groupName += `-${Math.floor(Math.random() * 10000000)}`;

	// Helper Methods
	const executeHandler = () => action();
	const activateInlineForm = () => (inlineEditingActive = true);
	const openLink = () => goto(action);

	// Handlers
	const escapeHandler = (event) => {
		if (event.key === 'Escape') {
			inlineFormCancelHandler();
			document.removeEventListener('keyup', escapeHandler, false);
		}
	};
	const editHandler = () => {
		if (actionType === 'handlerOnly') return executeHandler();
		if (actionType === 'href') return openLink();
		if (actionType === 'inlineForm') {
			document.addEventListener('keyup', escapeHandler, false);
			return activateInlineForm();
		}
		// edit state for actionType 'modal' is handled internally by Modal component
	};
	const inlineFormSubmitHandler = () => {
		// execute function passed in action
		action();
		inlineEditingActive = false;
	};
	const inlineFormCancelHandler = () => {
		dispatch('cancel'); // pass signal back to instance to reset edited value to saved value
		errors = null;
		inlineEditingActive = false;
	};
</script>

<template lang="pug">

  div.py-4.sm_grid.sm_py-5.m-0.sm_grid-cols-4.sm_gap-4

    p(id='label-{groupName}').font-medium.text-gray-500.py-2.border-t.border-transparent
      | {valueLabel}

    div(class='sm_mt-0.5').flex.mt-1.sm_col-span-3

      div.flex-grow
        +if("(actionType !== 'inlineForm') || !editAction || (actionType === 'inlineForm' && !inlineEditingActive)")
          // show read content for all types & persist this content for 'modal' and 'href' types
          slot(name='formReadView')

        +if("editAction && actionType === 'inlineForm' && inlineEditingActive")
          // switch to unique edit content for 'inlineForm' types that have an explicit edit action when they are in the edit state
          Form(
            horizontalForm='{true}'
            submitLabel='Save'
            submitHandler='{inlineFormSubmitHandler}'
            dismissible='{true}'
            dismissHandler='{inlineFormCancelHandler}'
            role='group'
            aria-labelledby='label-{groupName}'
            formLevelErrors='{errors}'
            )
            div(use:autoFocusFirstChildInput).flex-grow
              slot(name='formEditView')

      +if('editAction && !inlineEditingActive')

        +if("actionType !== 'modal'")
          span.ml-6.flex-shrink-0
            Button(label='{editActionLabel}' size='inline' level='tertiary' '{danger}' on:click='{editHandler}')

        +if("actionType === 'modal'")
          // Modal component has built in display of inline affordance
          Modal(
            affordanceButtonLabel='{editActionLabel}'
            affordanceButtonLevel='tertiary'
            affordanceButtonSize='inline'
            '{modalHeading}'
            '{modalActionLabel}'
            modalAction='{action}'
            modalAlternativeAction='{alternativeAction}'
            modalAlternativeActionLabel='{alternativeActionLabel}'
            modalIcon='{showModalIcon}'
            modalHasInput='{true}'
            '{danger}'
            '{errors}'
            on:closed!="{() => dispatch('modalClose')}"
            )

            svelte:fragment(slot="icon")
              +if('danger && !$$slots.modalIcon')
                IconWarning
              +if('$$slots.modalIcon')
                slot(name='modalIcon')

            svelte:fragment(slot="content")
              slot(name='modalText')

            svelte:fragment(slot="inputs")
              slot(name='modalInputs')

</template>
