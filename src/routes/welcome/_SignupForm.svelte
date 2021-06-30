<script>
	import { createEventDispatcher } from 'svelte';
	import * as http from '$lib/utils/http-methods';
	import { autoFocusFirstChildInput } from '$lib/utils/helpers';
	import { Form, Input, InputPassword } from '$lib/components/forms';
	import FormContainer from './_WelcomeFormContainer.svelte';

	// TODO: add TOS agreement checkbox
	// TODO: add async check of email address against registered accounts

	let email = '';
	let password = '';
	let error = null;

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
		error = null; // reset any errors
		try {
			const data = await http.post('/api/signupUser', { email, password });
			if (data.error) throw { message: data.error };
			dispatch('success', { submittedEmail: data.email });
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

        div(use:autoFocusFirstChildInput).space-y-4

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

</template>
