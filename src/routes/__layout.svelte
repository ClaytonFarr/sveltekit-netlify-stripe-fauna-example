<script context="module">
	export async function load({ session }) {
		// redirect un-authenticated visitors
		if (!session.user.authenticated) {
			return {
				status: 302,
				redirect: '/welcome',
			};
		}
		// else return requested view
		return true;
	}
</script>

<script>
	import { onMount } from 'svelte';
	import { session } from '$app/stores';
	// import { touchTime } from '$lib/store.js';
	import AppHeader from '$lib/components/AppHeader.svelte';
	import Notifications from '$lib/components/notifications/index.svelte'
	import '../app.css';

	const businessName = import.meta.env.VITE_BUSINESS_NAME;

	// TODO: finish 'touchTime' functionality for refreshing JWT token in background for active sessions
	// update touchTime on page load
	// onMount(() => ($touchTime = Date.now()));

	// update touchTime on each user interaction
	// const updateTouchTime = () => ($touchTime = Date.now());
</script>

<!-- <svelte:window on:click={updateTouchTime} /> -->

<template lang="pug">

	.flex.flex-col.w-full.min-h-screen
		+if('$session.user.authenticated')
			AppHeader('{businessName}')
		.flex-grow.w-full.max-w-7xl.mx-auto.p-4.sm_p-6.lg_p-8
			slot
	Notifications

</template>
