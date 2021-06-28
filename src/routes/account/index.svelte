<script>
	import SectionContainer from '$lib/components/SectionContainer.svelte';
	import IdentitySettings from './_IdentitySettings.svelte';
	// import NotificationSettings from './_NotificationSettings.svelte';
	import BillingSettings from './_BillingSettings.svelte';
	import DeleteIdentity from './_DeleteIdentity.svelte';
</script>

<svelte:head>
	<title>My Account &middot; {import.meta.env.VITE_BUSINESS_NAME}</title>
</svelte:head>

<template lang="pug">

  SectionContainer(heading='Identity' subheading='Your login credentials.')
    IdentitySettings

  //- SectionContainer(heading='Notifications' subheading="We'll always let you know about important changes, but you pick what else you'd like to hear about.")
  //-   NotificationSettings

  SectionContainer(heading='Billing' subheading='Manage your plan, payment information, and view past invoices.')
    BillingSettings

  SectionContainer(heading='Delete Account')
    DeleteIdentity

</template>
