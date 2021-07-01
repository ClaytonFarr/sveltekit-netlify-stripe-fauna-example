<script>
	import { onMount, createEventDispatcher } from 'svelte';
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { wait } from '$lib/utils/helpers';
	import { Form, Button } from '$lib/components/forms';
	import IconCheck from '$lib/components/icons/outline-check.svelte';
	import IconWarning from '$lib/components/icons/outline-warning.svelte';

	export let show = false;
	let modal = null; // modal DOM reference

	$: pointerEventsClass = show ? 'pointer-events-auto' : 'pointer-events-none';

	export let affordanceIsButton = true; // toggles between button and text
	export let affordanceButtonLabel = 'Open';
	export let affordanceButtonLevel = 'primary'; // primary, secondary, tertiary
	export let affordanceButtonSize = 'standard'; // featured, standard, inline
	export let affordanceButtonClasses = '';

	export let affordanceText = 'open'; // applicable when affordanceIsButton = false
	export let affordanceTextClasses = 'underline text-action cursor-pointer';

	export let modalHeading = 'Modal Heading';
	export let modalActionLabel = 'Confirm';
	export let modalAction = null;
	export let modalAlternativeAction = null;
	export let modalAlternativeActionLabel = null;
	export let modalConfirmAction = true;
	export let modalHasInput = false;
	export let modalIcon = true;
	export let formValid = modalHasInput ? false : true;
	export let danger = false;
	export let errors = null;

	const dispatch = createEventDispatcher();
	const iconBgColorClass = danger ? 'bg-red-50' : 'bg-brand-lightest';
	const modalName = `modal-title-${Math.floor(Math.random() * 10000000)}`;

	const openModal = async () => {
		show = true;
		// when modal opens, focus the first input if it exists
		await wait(100);
		if (modalHasInput) {
			const firstInput = modal.querySelector('input, textarea, select');
			if (firstInput) {
				firstInput.classList.add('autofocused');
				firstInput.focus();
			}
		}
		dispatch('opened');
	};
	const closeModal = () => {
		show = false;
		dispatch('closed');
	};
	const actionHandler = () => {
		modalAction();
		closeModal();
	};

	onMount(() => {
		const outsideModalClickHandler = (event) => {
			if (show && !modal.contains(event.target)) {
				show = false;
			}
		};
		const escapeModalHandler = (event) => {
			if (show && event.key === 'Escape') {
				show = false;
				dispatch('closed');
			}
		};

		// add listeners when element is added to the DOM
		document.addEventListener('click', outsideModalClickHandler, false);
		document.addEventListener('keyup', escapeModalHandler, false);

		// remove listeners when element is removed from the DOM
		return () => {
			document.removeEventListener('click', outsideModalClickHandler, false);
			document.removeEventListener('keyup', escapeModalHandler, false);
		};
	});
</script>

<template lang="pug">

  div(bind:this='{modal}')

    // Affordance
    div(on:click='{openModal}')
      +if('affordanceIsButton')
        Button(
          label='{affordanceButtonLabel}'
          level='{affordanceButtonLevel}'
          size='{affordanceButtonSize}'
          buttonClasses='{affordanceButtonClasses}'
          naturalWidth='{true}'
          '{danger}'
          )
        +else()
          span(class='{affordanceTextClasses}') {affordanceText}

    // Modal
    +if('show')
      div(
        class='{pointerEventsClass} modal fixed z-50 inset-0 overflow-y-auto'
        aria-labelledby='{modalName}'
        aria-modal='true'
        role='dialog'
        )
        div(class='{pointerEventsClass} flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm_block sm_p-0')

          // Background Shade
          div(
            in:scale='{{duration: 300, start: 1, easing: quintOut}}'
            out:scale='{{duration: 300, delay: 100, start: 1, easing: quintOut}}'
            class='shade {pointerEventsClass} fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
            aria-hidden='true'
            on:click='{closeModal}')

          // Element to make browser center modal contents
          span(aria-hidden='true').hidden.sm_inline-block.sm_align-middle.sm_h-screen &#8203;

          // Modal
          div(
            in:scale='{{duration: 300, delay: 100, start: .95, easing: quintOut}}'
            out:scale='{{duration: 300, start: .95, easing: quintOut}}'
            class='modal-panel {pointerEventsClass} inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm_my-8 sm_align-middle sm_max-w-lg sm_w-full sm_p-6'
            )
            div

              +if('modalIcon || danger')
                div(class='{iconBgColorClass} mx-auto flex items-center justify-center h-12 w-12 rounded-full')
                  slot(name='icon')
                    +if('danger')
                      IconWarning
                      +else()
                        IconCheck

              div(class="{modalIcon ? 'mt-3 sm_mt-5' : 'mt-1 sm_mt-3'}").text-center
                h3(id='{modalName}').text-lg.font-medium.text-gray-900 {modalHeading}

                +if('$$slots.content')
                  .mt-4.text-gray-700
                    slot(name='content')
                      // slot content should have wrapping tags as needed; can be single or multiple elements

                +if('modalHasInput')
                  Form(
                    isValid='{formValid}'
                    submitLabel='{modalActionLabel}'
                    submitHandler='{actionHandler}'
                    dismissible='{true}'
                    dismissHandler='{closeModal}'
                    fullWidthActions='{true}'
                    reverseActionsOrder='{true}'
                    actionsButtonSize='featured'
                    actionsClasses='mt-6 sm_mt-8'
                    formClasses='text-left'
                    formLevelErrors='{errors}'
                    '{danger}'
                    )
                    slot(name='inputs')

                +if('!modalHasInput')
                  .mt-6.sm_mt-8.sm_grid.sm_grid-cols-2.sm_gap-3.sm_grid-flow-row-dense
                    +if('modalConfirmAction')
                      Button(label='Cancel' level='secondary' on:click='{closeModal}')
                    Button(label='{modalActionLabel}' type='submit' '{danger}' on:click='{actionHandler}' disabled='{!formValid}')

              +if('modalAlternativeAction')
                p(on:click!='{() => modalAlternativeAction()}').mt-4.sm_mt-6.mb-1.sm_mb-2.text-center.font-medium.text-action.hover_text-action-hover.cursor-pointer
                  | {modalAlternativeActionLabel}

</template>
