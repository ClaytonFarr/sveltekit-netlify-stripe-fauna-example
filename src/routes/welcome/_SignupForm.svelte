<script>
	import { createEventDispatcher } from 'svelte';
	import * as http from '$lib/utils/http';
	import autofocusFirstChildInput from '$lib/utils/autofocusFirstChildInput';
	import { Form, Input, InputPassword } from '$lib/components/forms';
	import FormContainer from './_FormContainer.svelte';

	// let name = '';
	let email = '';
	let password = '';
	// let notifyUpdates = false;
	// let notifyOffers = false;
	let error = null;

	// TODO: add TOS agreement checkbox
	// TODO: add async check of email address against registered accounts

	const dispatch = createEventDispatcher();
	const resetForm = () => {
		email = '';
		password = '';
		error = null;
	};
	const signInHandler = () => {
		resetForm();
		dispatch('login');
	};
	const signupHandler = async () => {
		error = null; // reset any error
		try {
			const data = await http.post('/api/signupUser', {
				// name,
				email,
				password,
			});
			// if unsuccessful
			if (!data.ok || data.body.error) throw { message: data.body.error };
			// if successful
			dispatch('success', { submittedEmail: data.body.email });
		} catch (err) {
			error = [err.message];
		}
	};
</script>

<template lang="pug">

  FormContainer(
    heading='Start your free trial'
    )

    svelte:fragment(slot='subheading')
      | Or 
      span.font-medium.text-action.hover_text-action-hover.cursor-pointer(on:click='{signInHandler}')
        | sign in to your account

    svelte:fragment(slot='content')
      Form(
        fullWidthActions='{true}'
        submitLabel='Start Trial'
        processingLabel='Sending…'
        submitHandler='{signupHandler}'
        formLevelErrors='{error}'
        )

        div(use:autofocusFirstChildInput).space-y-4

          Input(
            label='Email Address'
            type='email'
            name='email'
            autocomplete='email'
            required
						showRequiredHint='{false}'
            bind:value='{email}'
            )
          InputPassword(
            label='Password'
            name='password'
            autocomplete='new-password'
            required
						showRequiredHint='{false}'
            bind:value='{password}'
            )

          // TODO: move notifications elections to a post signup flow;
          // need user to exist in Fauna before they can be saved
          //- .flex.items-center.space-x-3
          //-   b.font-medium Notify me of 
          //-   Input(
          //- 		type='checkbox'
          //- 		label='Product Updates'
          //- 		name='notify-updates'
          //- 		bind:checked='{notifyUpdates}'
          //- 		)
          //-   Input(
          //- 		type='checkbox'
          //- 		label='Promotions'
          //- 		name='notify-offers'
          //- 		bind:checked='{notifyOffers}'
          //- 		)

</template>
