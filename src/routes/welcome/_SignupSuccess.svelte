<script>
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/forms';
	import FormContainer from './_WelcomeFormContainer.svelte';

	export let submittedEmail = null;

	const dispatch = createEventDispatcher();
	const signInHandler = () => dispatch('login');
</script>

<template lang="pug">

	FormContainer(
		heading='Confirm your account'
		)

		svelte:fragment(slot='subheading')
			+if('submittedEmail')
				| Please check for an email at #[b.font-medium {submittedEmail}].
				+else()
					| Please check for an email in your inbox.

		svelte:fragment(slot='content')
			.mt-6
				Button(label='Return to Sign In' on:click='{signInHandler}')

</template>
