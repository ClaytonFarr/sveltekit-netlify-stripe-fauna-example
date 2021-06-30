<script context="module">
	export async function load({ session }) {
		// NOTE - user must be logged-in / have a valid JWT cookie to execute 'confirmEmailUpdate' successfully
		// redirect un-authenticated visitors
		if (!session.user.authenticated) {
			return {
				status: 302,
				redirect: '/welcome?origin=update-email',
			};
		}
		// else return requested view
		return true;
	}
</script>

<script>
	import { goto } from '$app/navigation';
	import { browser } from '$app/env';
	import { session } from '$app/stores';
	import { emailUpdatePending } from '$lib/store.js';
	import * as http from '$lib/utils/http-methods';

	const businessName = import.meta.env.VITE_BUSINESS_NAME;
	let windowWidth = null;
	const tailwindLgBreakpoint = 1024;

	// VERIFY TOKEN
	// -------------------------------------------------------
	let emailUpdateSuccess = null;

	// make request to update email with JWT cookie
	const confirmEmailUpdate = async (updateToken) => {
		try {
			let data = await http.post('/api/updateEmailConfirm', { updateToken });
			// if confirmation request fails, throw error
			if (data.error) throw {};
			console.log('data :', data);
			// if confirmation unable to reset JWT cookie have
			//    user log back in to refresh claims for UI
			if (data.jwtUpdated === false) {
				http.post('/api/logoutUser');
				$emailUpdatePending = false;
				$session.user = {};
				goto('/welcome?email-updated');
			}
			// if confirmation able to reset JWT cookie
			// ...reset flag for emailUpdatePending message,
			$emailUpdatePending = false;
			// ...update client session with new JWT claims
			//    (next server rendered page/request will use new JWT cookie)
			$session.user.email = data.newEmail;
			// ...toggle correct UI for this view,
			emailUpdateSuccess = true;
		} catch (err) {
			// toggle correct UI for this view
			emailUpdateSuccess = false;
		}
	};

	// check for update token on page load
	const tokenName = `#email_change_token`;
	if (browser && location.hash && location.hash.startsWith(tokenName)) {
		const token = location.hash.slice(tokenName.length + 1);
		confirmEmailUpdate(token);
	}
	if (browser && (!location.hash || !location.hash.startsWith(tokenName))) {
		emailUpdateSuccess = false;
	}
</script>

<svelte:head>
	<title>Update Email &middot; {import.meta.env.VITE_BUSINESS_NAME}</title>
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

<template lang="pug">

  .flex.min-h-screen.bg-white
    .flex.flex-col.justify-center.flex-1.px-4.py-12.sm_px-6.lg_flex-none.lg_px-20.xl_px-24
      div(class="md_h-3/4").w-full.max-w-sm.mx-auto.lg_w-96

        // Form
        div
          img.w-auto.h-12(src='/app-logo-mark.svg' alt='{businessName}' height='48')

          h2.mt-6.text-3xl.font-extrabold.text-gray-900 Update Email Address

          +if('emailUpdateSuccess === null')
            p.mt-3.text-gray-600.max-w Verifying email update token…

          +if('emailUpdateSuccess === false')
            .text-gray-600.max-w
              p.mt-3 We were unable to update email address &ndash; your token may have expired. Would you like to #[a(href='/account').font-medium.text-action.hover_text-action-hover.cursor-pointer try again]?
              p.mt-4 #[a(href='/').font-medium.text-action.hover_text-action-hover.cursor-pointer &larr; Return to Application]

          +if('emailUpdateSuccess === true')
            .text-gray-600.max-w
              p.mt-3 Email updated successfully.
              p.mt-2 #[a(href='/').font-medium.text-action.hover_text-action-hover.cursor-pointer &larr; Return to Application]

    // Photo
    +if('windowWidth > tailwindLgBreakpoint - 1')
      .relative.flex-1.hidden.w-0.lg_block
        img.absolute.inset-0.object-cover.w-full.h-full(src='https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixqx=ZpHulnDdtb&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80' alt='')

</template>
