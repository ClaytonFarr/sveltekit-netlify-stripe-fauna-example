<script context="module">
	export function load({ error, status }) {
		return {
			props: {
				status,
				errorMessage: error.message
			}
		};
	}
</script>

<script>
	import { session } from '$app/stores';
	export let status, errorMessage;
</script>

<template lang="pug">

	.min-h-screen.flex.flex-col.align-middle.justify-center.items-center
		.flex.items-center.justify-items-stretch.divide-x.border.text-gray-900.mb-4
			h1.text-lg.font-medium.px-3 { status }
			p.px-3.py-2 { errorMessage }
		+if('!$session.user.authenticated')
			a(href='/').text-action.underline Back to Home

</template>
