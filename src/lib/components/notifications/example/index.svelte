<script>
	import Notifications from '$lib/components/notifications/index.svelte';
	import { notifications } from '$lib/components/notifications/store.js';

	const defaultNotification = () => {
		notifications.default({
			message: 'Default message',
		});
	};
	const infotNotification = () => {
		notifications.info({
			message: 'Info message',
			detail: 'Message detail',
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

<div class="button-group">
	<button on:click={defaultNotification}>Default</button>
	<button on:click={infotNotification}>Info</button>
	<button on:click={successNotification}>Success</button>
	<button on:click={warningNotification}>Warning</button>
	<button on:click={dangerNotification}>Danger</button>

	<Notifications />
	<!-- <Notifications horizontalPlacement='right' /> -->
	<!-- <Notifications verticalPlacement='bottom' /> -->
	<!-- <Notifications verticalPlacement='bottom' horizontalPlacement='stretch' /> -->
</div>

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
