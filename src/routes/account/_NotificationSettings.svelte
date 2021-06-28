<script>
	import SingleValueFormContainer from '$lib/components/SingleValueFormContainer.svelte';
	import { Input } from '$lib/components/forms';

	// LATER: clean 'editing' logic to show save / cancel buttons correctly
	let editing = false;

	// LATER: populate saved option settings from Fauna on page load
	// LATER: update '...Saved' variables with new values from Fuana on successful save
	let updatesOptionSaved = false;
	let offersOptionSaved = false;

	let updatesOptionCurrent = updatesOptionSaved;
	let offersOptionCurrent = offersOptionSaved;

	const changeHandler = () => (editing = true); // toggle editing to 'true' if any edits have been made

	const cancelHandler = () => {
		// LATER: finish logic to reset unsaved options to original settings on cancel
		updatesOptionCurrent = updatesOptionSaved;
		offersOptionCurrent = offersOptionSaved;
	};

	const emailNotificationOptions = [
		{ label: 'One', value: 1, note: "I'm number 1." },
		{ label: 'Two', value: 2, note: 'Lucky number 3.' },
	];
	let group = ['2'];
</script>

<template lang="pug">

  // LATER: add UX to select these choices post signup
  SingleValueFormContainer(
    valueLabel="By Email" 
    editAction="{false}" 
    actionType="inlineForm" 
    action="userData-update"
    on:cancel!='{cancelHandler}'
    )
      // TODO: update this content to be displayed within form in 'formEditView'
      //       and to show save/cancel buttons when saved checkbox states are changed
      svelte:fragment(slot="formReadView")
        .flex.flex-col.space-y-5.items-start.pt-2.pl-3
          Input(
            type='checkbox'
            label="Product Updates"
            name="product-updates"
            note="Get notified when new functionality is added."
            bind:checked='{updatesOptionCurrent}'
            on:input='{changeHandler}'
            )
          Input(
            type='checkbox'
            label="Product Offers"
            name="product-offers"
            note="Get notified when promotions are available."
            bind:checked='{offersOptionCurrent}'
            on:input='{changeHandler}')

</template>
