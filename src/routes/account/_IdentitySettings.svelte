<script>
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as http from '$lib/utils/http-methods';
	import { validateEmailAddress } from '$lib/utils/helpers';
	import { emailUpdatePending } from '$lib/store.js';
	import { notifications } from '$lib/components/notifications/store.js';
	import { Input, InputPassword, Button } from '$lib/components/forms';
	import SingleValueFormContainer from '$lib/components/SingleValueFormContainer.svelte';
	import IconKey from '$lib/components/icons/outline-key.svelte';
	import IconMail from '$lib/components/icons/outline-mail.svelte';

	// ------------------------------------------------------------------------------------------------
	//  UPDATE EMAIL ADDRESS
	// ------------------------------------------------------------------------------------------------

	let savedEmail = $session.user.email || null;
	let newEmail = null;
	let newEmailConfirmation = null;
	let updateEmailPassword = null;

	const resetEmailInputs = () => {
		// have to reset inputs manually [as opposed to .reset() event on form) since inputs values are bound to variables
		savedEmail = $session.user.email || null;
		newEmail = null;
		newEmailConfirmation = null;
		updateEmailPassword = null;
	};

	const updateEmailAddress = async () => {
		const valid = validateEmailAddress(newEmail);
		const unique = newEmail !== savedEmail;
		if (valid && unique) {
			try {
				const request = await http.post('/api/updateEmailRequest', { newEmail, password: updateEmailPassword });
				if (request.error) throw { message: request.error };
				$emailUpdatePending = true;
				notifications.success({
					message: 'Email Update Submitted',
					detail: 'Please check for an email in your inbox to complete update',
				});
			} catch (err) {
				newEmail = savedEmail;
				notifications.warning({
					message: 'Unable to Update',
					detail: err.message,
				});
			}
		} else if (!unique) {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'New email is the same as your current email address.',
			});
		} else if (!valid) {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'Please double-check for errors in new email entered.',
			});
		} else {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'Please try again',
				secondsDisplayed: 3,
			});
		}
		resetEmailInputs();
	};

	// ------------------------------------------------------------------------------------------------
	//  UPDATE PASSWORD
	// ------------------------------------------------------------------------------------------------

	let currentPassword, newPassword, newPasswordConfirmation;

	const resetPasswordInputs = () => {
		// have to reset inputs manually [as opposed to .reset() event on form) since inputs values are bound to variables
		currentPassword = null;
		newPassword = null;
		newPasswordConfirmation = null;
	};

	const requestPasswordRecovery = () => goto('/welcome?reset');

	const updatePassword = async () => {
		const confirmed = newPassword === newPasswordConfirmation;
		const unique = currentPassword !== newPassword;
		if (confirmed && unique) {
			try {
				const request = await http.post('/api/updatePassword', { currentPassword, newPassword });
				if (request.error) throw { message: request.error };
				notifications.success({
					message: 'Password Updated',
					secondsDisplayed: 3,
				});
			} catch (err) {
				notifications.warning({
					message: 'Unable to Update',
					detail: err.message,
				});
			}
		} else if (!confirmed) {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'New password confirmation did not match.',
			});
		} else if (!unique) {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'New password must be different than current password.',
			});
		} else {
			notifications.warning({
				message: 'Unable to Update',
				detail: 'Please try again.',
				secondsDisplayed: 3,
			});
		}
		resetPasswordInputs();
	};
</script>

<template lang="pug">

  // Example inline form markup
  //- +if('!$emailUpdatePending')
  //-   SingleValueFormContainer(
  //-     valueLabel="Email Address"
  //-     action="{updateEmailAddress}"
  //-     actionType="inlineForm"
  //-     on:cancel!='{() => newEmail = savedEmail}'
  //-     )
  //-     Input(slot='formReadView' type='email' bind:value='{savedEmail}' readonly leftPadding='{true}')
  //-     Input(slot='formEditView' type='email' required='{true}' bind:value='{newEmail}')

  //- +if('$emailUpdatePending')
  //-   div(role='group' aria-labelledby='label-email-update-pending').py-4.sm_grid.sm_py-5.sm_grid-cols-4.sm_gap-4
  //-     p(id='label-email-update-pending').font-medium.text-gray-500.py-2.border-t.border-transparent Email Address
  //-     .flex.mt-1.sm_mt-0.sm_col-span-3
  //-       div.flex-grow
  //-         p.py-2.px-3 #[span.inline-block Update pending - check new email address inbox for message.]
  //-       span.ml-6.flex-shrink-0
  //-         Button(label='Cancel' size='inline' level='tertiary' on:click!='{() => $emailUpdatePending = false}')

  // EMAIL ADDRESS

  +if('!$emailUpdatePending')
    SingleValueFormContainer(
      valueLabel="Email Address"
      action="{updateEmailAddress}"
      actionType="modal"
      modalHeading="Update Email"
      modalActionLabel="Update Email"
      on:modalClose='{resetEmailInputs}'
      )

      svelte:fragment(slot="formReadView")
        p.py-2.px-3 {savedEmail}

      // Modal
      svelte:fragment(slot="modalIcon")
        IconMail

      svelte:fragment(slot="modalText")
        p You'll receive a confirmation message at your new email address.

      svelte:fragment(slot="modalInputs")
        Input(
          label='New Email Address' 
          type='email'
          required='{true}'
          showRequiredHint='{false}'
          bind:value='{newEmail}'
          )
        Input(
          label='Confirm Email Address' 
          note='Important - Please take a moment to double check your new address.'
          type='email'
          required='{true}'
          showRequiredHint='{false}'
          bind:value='{newEmailConfirmation}'
          pattern='{newEmail}'
          patternMessage='Email addresses do not match.'
          )
        InputPassword(
          label='Current Password' 
          bind:value='{updateEmailPassword}'
          required='{true}'
          showRequiredHint='{false}'
          )

  +if('$emailUpdatePending')
    div(role='group' aria-labelledby='label-email-update-pending').py-4.sm_grid.sm_py-5.sm_grid-cols-4.sm_gap-4
      p(id='label-email-update-pending').font-medium.text-gray-500.py-2.border-t.border-transparent Email Address
      div(class='sm_mt-0.5').flex.mt-1.sm_col-span-3
        div.flex-grow
          p.py-2.px-3 #[span.inline-block Update pending - check new email address inbox for message.]
        span.ml-6.flex-shrink-0
          Button(label='Cancel' size='inline' level='tertiary' on:click!='{() => $emailUpdatePending = false}')


  // PASSWORD

  SingleValueFormContainer(
    valueLabel="Password"
    action="{updatePassword}"
    actionType="modal"
    modalHeading="Update Password"
    modalActionLabel="Update Password"
    alternativeAction='{requestPasswordRecovery}'
    alternativeActionLabel="I've forgotten my current password."
    on:modalClose='{resetPasswordInputs}'
    )

    svelte:fragment(slot="formReadView")
      p.py-2.px-3 ••••••••••••

    // Modal
    svelte:fragment(slot="modalIcon")
      IconKey

    svelte:fragment(slot="modalText")
      p.px-8 Your password must be at least 12 characters - you can use spaces, letters, numbers, and/or symbols.

    svelte:fragment(slot="modalInputs")
      InputPassword(
        label='Current Password' 
        bind:value='{currentPassword}'
        required='{true}'
        showRequiredHint='{false}'
        )
      InputPassword(
        label='New Password' 
        bind:value='{newPassword}'
        required='{true}'
        showRequiredHint='{false}'
        newPassword='{true}'
        pattern='^(?!\\b{currentPassword}\\b).*$'
        patternMessage='New password must be different than current password.'
        )
      InputPassword(
        label='Confirm New Password'
        bind:value='{newPasswordConfirmation}'
        required='{true}'
        showRequiredHint='{false}'
        pattern='{newPassword}'
        patternMessage='New passwords do not match.'
        validateOnInput='{false}'
        )

</template>
