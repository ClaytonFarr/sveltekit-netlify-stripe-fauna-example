<script>
	import { createEventDispatcher } from 'svelte';
	import { Button } from '$lib/components/forms';
	import FormContainer from './_WelcomeFormContainer.svelte';

	const dispatch = createEventDispatcher();
	const signInHandler = () => dispatch('login');
</script>

<template lang="pug">

	FormContainer(
		heading='Reset your password'
		)

		svelte:fragment(slot='subheading')
			| Please check for an email in your inbox.

		svelte:fragment(slot='content')
			.mt-6
					Button(label='Return to Sign In' on:click='{signInHandler}')

</template>
