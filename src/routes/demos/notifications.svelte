<script>
	import Notifications from '$lib/components/notifications/index.svelte';
	import { notifications } from '$lib/components/notifications/store.js';

	const defaultNotification = () => {
		notifications.default({
			message: 'Default message',
		});
	};
	const infoNotification = () => {
		notifications.info({
			message: 'Info message',
			detail: '2 second display',
			secondsDisplayed: 2,
		});
	};
	const successNotification = () => {
		notifications.success({
			message: 'Success message',
			detail: 'Message detail',
			dismissable: false,
		});
	};
	const warningNotification = () => {
		notifications.warning({
			message: 'Warning message',
			detail: 'Message detail',
		});
	};
	const dangerNotification = () => {
		notifications.danger({
			message: 'Danger message',
			detail: 'Message detail',
		});
	};
</script>

<template lang="pug">

	.prose.mb-10
		h1(class='!mb-2 !text-3xl') Svelte notifications component
		p.text-sm.text-gray-500.leading-6 Displays 1+ notifications with smart defaults and animation. Can prescribe notification location, type, heading and detail content, time on screen, and whether user can dismiss.
		p.text-sm.text-gray-500.leading-6 See #[a(href="https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/tree/master/src/lib/components/notifications") component code] for configuration options.
		p.text-sm.text-gray-500.leading-6: em Derived from Kev's #[a(href='https://svelte.dev/repl/8c54d499f26e444c874f3e2933b7965c') Notification Toast Custom Store]

	.button-group
		button(on:click='{defaultNotification}') Default
		button(on:click='{infoNotification}') Info
		button(on:click='{successNotification}') Success
		button(on:click='{warningNotification}') Warning
		button(on:click='{dangerNotification}') Danger

	Notifications
	<!-- Notifications(horizontalPlacement='right') -->
	<!-- Notifications(verticalPlacement='bottom') -->
	<!-- Notifications(verticalPlacement='bottom' horizontalPlacement='stretch') -->
</template>

<style>
	.button-group {
		display: flex;
	}
	button {
		padding: 0.5rem 1rem;
		background: #ddd;
		margin-right: 1em;
	}
</style>
