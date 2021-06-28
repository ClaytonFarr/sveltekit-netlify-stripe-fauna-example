<script>
	import { createEventDispatcher } from 'svelte';
	import * as http from '$lib/utils/http';
	import autofocusFirstChildInput from '$lib/utils/autofocusFirstChildInput';
	import { Form, Input } from '$lib/components/forms';
	import FormContainer from './_FormContainer.svelte';

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
		error = null; // reset any error
		try {
			const data = await http.post('/api/passwordRecoveryRequest', { email });
			// if unsuccessful
			if (!data.ok || data.body.error) throw { message: data.body.error };
			// if successful
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
				tertiaryActionLabel='Return to Sign In'
				tertiaryActionType='handler'
				tertiaryActionLink='{cancelHandler}'
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

</template>
