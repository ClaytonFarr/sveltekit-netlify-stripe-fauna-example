<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { notifications } from '$lib/components/notifications/store.js';
	import * as http from '$lib/utils/http-methods';
	import SingleValueFormContainer from '$lib/components/SingleValueFormContainer.svelte';

	let planLevel = 'Loading...';
	const retrievePlan = async () => {
		try {
			const currentPlan = await http.get('/api/retrievePlan');
			if (currentPlan.error || !currentPlan.plan) {
				throw {};
			}
			planLevel = currentPlan.plan;
		} catch (err) {
			planLevel = `Click 'Manage' to view and edit current plan.`;
		}
	};

	const manageBillingHandler = async () => {
		try {
			const manageBillingLink = await http.get('/api/manageBilling');
			if (manageBillingLink.error || !manageBillingLink.link) {
				throw { message: manageBillingLink.error };
			}
			goto(manageBillingLink.link);
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
