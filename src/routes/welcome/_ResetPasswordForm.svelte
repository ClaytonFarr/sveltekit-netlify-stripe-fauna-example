<script>
	import { createEventDispatcher } from 'svelte';
	import * as http from '$lib/utils/http-methods';
	import { autoFocusFirstChildInput } from '$lib/utils/helpers';
	import { Form, Input } from '$lib/components/forms';
	import FormContainer from './_WelcomeFormContainer.svelte';

	export let loggedInUserResettingPassword = false;

	let email = '';
	let error = null;

	const dispatch = createEventDispatcher();
	const resetForm = () => {
		email = '';
		error = null;
	};
	const cancelHandler = () => {
		resetForm();
		dispatch('cancel');
	};
	const resetHandler = async () => {
		error = null; // reset any errors
		try {
			const data = await http.post('/api/passwordRecoveryRequest', { email });
			if (data.error) throw { message: data.error };
			dispatch('success');
		} catch (err) {
			error = [err.message];
		}
	};
</script>

<template lang="pug">

	FormContainer(
		heading='Reset your password'
		)

		svelte:fragment(slot='subheading')
			| Enter your email and we'll send you a link.

		svelte:fragment(slot='content')
			Form(
				fullWidthActions='{true}'
				submitLabel='Send Password Reset Email'
				processingLabel='Sending…'
				submitHandler='{resetHandler}'
				tertiaryAction='{true}'
				tertiaryActionLabel="{loggedInUserResettingPassword ? 'Cancel' : 'Return to Sign In'}"
				tertiaryActionType="{loggedInUserResettingPassword ? 'href' : 'handler'}"
				tertiaryActionLink="{loggedInUserResettingPassword ? '/account' : cancelHandler}"
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

</template>
