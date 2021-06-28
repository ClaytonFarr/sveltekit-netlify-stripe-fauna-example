<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { notifications } from '$lib/components/notifications/store.js';
	import * as http from '$lib/utils/http';
	import SingleValueFormContainer from '$lib/components/SingleValueFormContainer.svelte';

	let planLevel = 'Loading...';
	const retrievePlan = async () => {
		try {
			const currentPlanRequest = await http.get('/api/retrievePlan');
			// console.log(Date.now(), ': BillingSettings currentPlanRequest :', currentPlanRequest);
			// if unsuccessful
			if (!currentPlanRequest.ok || !currentPlanRequest.body.plan || currentPlanRequest.body?.error)
				throw { message: currentPlanRequest.body?.error.toString() };
			// if successful
			planLevel = currentPlanRequest.body.plan;
		} catch (err) {
			planLevel = `Click 'Manage' to view and edit current plan.`;
		}
	};

	const manageBillingHandler = async () => {
		try {
			const manageBillingRequest = await http.get('/api/manageBilling');
			// console.log(Date.now(), ': BillingSettings manageBillingRequest :', manageBillingRequest);
			// if unsuccessful
			if (!manageBillingRequest.ok || !manageBillingRequest.body.link || manageBillingRequest.body?.error)
				throw { message: manageBillingRequest.body?.error.toString() };
			// if successful
			goto(manageBillingRequest.body.link);
		} catch (err) {
			notifications.warning({
				message: 'Error',
				detail: err.message || 'We encountered a system error - please try again.',
			});
		}
	};

	onMount(() => retrievePlan());
</script>

<template lang="pug">

  SingleValueFormContainer(
		valueLabel="Plan"
		editActionLabel="Manage"
		actionType="handlerOnly"
		action='{manageBillingHandler}'
		)
    svelte:fragment(slot="formReadView")
      p.py-2.px-3 {planLevel}

</template>
