<script>
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { notifications } from '$lib/components/notifications/store.js';
	import * as http from '$lib/utils/http-methods';
	import { Input, InputPassword } from '$lib/components/forms';
	import IconTrash from '$lib/components/icons/outline-trash.svelte';
	import SingleValueFormContainer from '$lib/components/SingleValueFormContainer.svelte';

	const helpEmailAddress = import.meta.env.VITE_BUSINESS_HELP_EMAIL;

	let deletePassphrase = 'DELETE MY ACCOUNT';
	let deleteConfirmation;
	let password = null;

	const resetInputs = () => {
		// have to reset inputs manually [as opposed to .reset() event on form) since inputs values are bound to variables
		deleteConfirmation = null;
		password = null;
	};
	const deleteIdentityHandler = async () => {
		const confirmed = deletePassphrase === deleteConfirmation;
		if (confirmed) {
			try {
				const request = await http.post('/api/deleteUser', { password });
				if (request.error) throw { message: request.error };
				goto('/deleted?success');
			} catch (err) {
				notifications.warning({
					message: 'Unable to Delete',
					detail: err.message || null,
				});
			}
		} else if (!confirmed) {
			notifications.warning({
				message: 'Unable to Delete',
				detail: 'Confirm account deletion with passphrase.',
			});
		} else {
			notifications.warning({
				message: 'Unable to Delete',
				detail: 'Please try again.',
				secondsDisplayed: 3,
			});
		}
		resetInputs();
	};
</script>

<template lang="pug">

  SingleValueFormContainer(
    valueLabel="Permanently Delete"
    editActionLabel="Delete"
    action='{deleteIdentityHandler}'
    actionType="modal"
    modalHeading="Are you absolutely sure?"
    modalActionLabel="Delete My Account"
    danger
    on:modalClose='{resetInputs}'
    )

    // Content
    svelte:fragment(slot="formReadView")
      p.py-2.px-3 Deleting is an irreversible action - 
        a(href=`mailto:${helpEmailAddress}?subject=Help`).underline.text-action can we help?

    // Modal
    svelte:fragment(slot="modalIcon")
      IconTrash
    svelte:fragment(slot="modalText")
      p This action #[span.text-red-700.font-medium cannot be undone] and will permanently delete your account and all data. Alternatively, you can #[span(on:click!='{() => {}}').cursor-pointer.underline.text-action downgrade your plan].
      p.text-gray-900.px-3.py-2.my-6.rounded-sm.bg-red-50 Please type #[b {deletePassphrase}] to confirm.

    svelte:fragment(slot="modalInputs")
      Input(
        label='Confirmation'
        bind:value='{deleteConfirmation}'
        required='{true}'
        showRequiredHint='{false}'
        pattern='{deletePassphrase}'
        patternMessage='Please enter confirmation.'
        )
      InputPassword(
        label='Password'
        bind:value='{password}'
        required='{true}'
        showRequiredHint='{false}'
        )

</template>
