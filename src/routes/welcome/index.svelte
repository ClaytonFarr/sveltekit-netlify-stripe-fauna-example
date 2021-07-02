<script context="module">
	export async function load({ page, session }) {
		// check flags for uses cases that require special load state or messaging
		const loggedInUserResettingPassword = page.query.has('reset');
		const updatingEmailAddress = page.query.toString().includes('update-email');
		const emailUpdated = page.query.has('email-updated');
		// TODO: add flag to check for sessions that timed out (JWT cookie expired)
		// const sessionExpired = false;

		// redirect authenticated visitors
		if (session.user.authenticated && !loggedInUserResettingPassword) {
			return {
				status: 302,
				redirect: '/',
			};
		}

		return {
			props: {
				loggedInUserResettingPassword,
				updatingEmailAddress,
				// sessionExpired,
				emailUpdated,
			},
		};
	}
</script>

<script>
	import { browser } from '$app/env';
	import { session } from '$app/stores';
	import { goto } from '$app/navigation';
	import { notifications } from '$lib/components/notifications/store.js';
	import * as http from '$lib/utils/http-methods';
	import LoginForm from './_LoginForm.svelte';
	import ResetPasswordForm from './_ResetPasswordForm.svelte';
	import ResetPasswordSuccess from './_ResetPasswordSuccess.svelte';
	import SignupForm from './_SignupForm.svelte';
	import SignupSuccess from './_SignupSuccess.svelte';

	export let loggedInUserResettingPassword;
	export let updatingEmailAddress;
	export let emailUpdated;
	// export let sessionExpired;

	const businessName = import.meta.env.VITE_BUSINESS_NAME;
	let login = true;
	let loginDestination = '/';
	let signupSuccess = false;
	let submittedEmail = null;
	let reset = false;
	let resetSuccess = false;
	let confirming = false;
	let windowWidth = null;
	const tailwindLgBreakpoint = 1024;
	$: formPageBackgroundColor = login ? 'bg-white' : 'bg-action-highlight';

	// ----------------------------------------------------------------------------------------
	// Users that are validating signup
	// ----------------------------------------------------------------------------------------
	const checkConfirmationToken = async (token) => {
		try {
			let data = await http.post('/api/confirmUser', { token });
			if (data.error) throw {};
			$session.user = data.user || {};
			goto('/');
		} catch (err) {
			goto('/welcome');
		}
	};
	// confirm new account, when a token is present
	const tokenName = `#confirmation_token`;
	if (browser && location.hash && location.hash.startsWith(tokenName)) {
		confirming = true;
		const token = location.hash.slice(tokenName.length + 1);
		checkConfirmationToken(token);
	}

	// ----------------------------------------------------------------------------------------
	// Users arriving at /welcome to reset password
	// ----------------------------------------------------------------------------------------
	if (loggedInUserResettingPassword) reset = true; // load form in correct state

	// ----------------------------------------------------------------------------------------
	// Users that had session expire / time out
	// ----------------------------------------------------------------------------------------
	// if (sessionExpired) {
	// 	// display messaging to orient user
	// 	setTimeout(() => {
	// 		notifications.info({
	// 			message: 'Signed Out',
	// 			detail: 'Your session has expired, please sign in again.',
	// 		});
	// 	}, 300);
	// }

	// ----------------------------------------------------------------------------------------
	// Logged-out users that are confirming an email address change
	// ----------------------------------------------------------------------------------------
	const updateEmailTokenName = `#email_change_token`;
	// add messaging and correct routing, if flag true and token present
	// token will be present in URL for logged out users redirected from /update-email
	if (updatingEmailAddress && browser && location.hash && location.hash.startsWith(updateEmailTokenName)) {
		// save token value for redirection post login
		const updateEmailToken = location.hash.slice(updateEmailTokenName.length + 1);
		// direct user to correct path with necessary values
		loginDestination = `/update-email${updateEmailTokenName}=${updateEmailToken}`;
		// display messaging to orient user
		setTimeout(() => {
			notifications.success({
				message: 'Email Update Submitted',
				detail: 'Please sign in with your original credentials to confirm your new email address.',
				secondsDisplayed: 60,
			});
		}, 300);
	}

	// ----------------------------------------------------------------------------------------
	// Users who successfully updated email but had to log out/in to renew JWT claims
	// ----------------------------------------------------------------------------------------
	if (emailUpdated) {
		// display messaging to orient user
		setTimeout(() => {
			notifications.success({
				message: 'Email Updated Successfully',
				detail: 'Please login with new address.',
			});
		}, 300);
	}

	// ----------------------------------------------------------------------------------------
	// Handlers
	// ----------------------------------------------------------------------------------------
	const toggleLoginForm = () => {
		signupSuccess = false; // reset flag, post signup
		reset = false; // reset flag, post reset
		resetSuccess = false; // reset flag, post reset
		login = !login; // toggle state between login & signup / reset
	};
	const toggleSignupSuccess = (e) => {
		submittedEmail = e.detail.submittedEmail; // pass submitted email to SignupSuccess
		signupSuccess = !signupSuccess; // toggle state to SignupSuccess
	};
	const toggleResetForm = () => {
		reset = !reset; // toggle state between login & reset
	};
	const toggleResetSuccess = () => {
		resetSuccess = !resetSuccess; // toggle state to ResetSuccess
	};
</script>

<svelte:head>
	<title>Welcome &middot; {import.meta.env.VITE_BUSINESS_NAME}</title>
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

<template lang="pug">

  div(class='flex min-h-screen {formPageBackgroundColor}')
    .flex.flex-col.flex-1.justify-center.lg_justify-start.px-4.sm_px-6.py-12.lg_pt-36.lg_flex-none.lg_px-20.xl_px-24
      div(class="md_h-3/4").w-full.max-w-sm.mx-auto.lg_w-96

        +if('confirming')
          img.w-auto.h-12(src='/app-logo-mark.svg' alt='{businessName}' height='48')
          h2.mt-6.text-3xl.font-extrabold.text-gray-900 Welcome
          p.mt-3.text-gray-600.max-w Verifying your new account…

        +if('!confirming')
          .mt-8
            +if('login')
              +if('!reset')
                LoginForm(on:signup='{toggleLoginForm}' on:reset='{toggleResetForm}' successDestination='{loginDestination}')
                +elseif('!resetSuccess')
                  ResetPasswordForm(on:cancel='{toggleResetForm}' on:success='{toggleResetSuccess}' '{loggedInUserResettingPassword}')
                  +else()
                    ResetPasswordSuccess(on:login!='{() => { reset = false; resetSuccess = false }}')
              +else()
                +if('!signupSuccess')
                  SignupForm(on:login='{toggleLoginForm}' on:success='{toggleSignupSuccess}')
                  +else()
                    SignupSuccess('{submittedEmail}' on:login='{toggleLoginForm}')

    // Photo
    +if('windowWidth > tailwindLgBreakpoint - 1')
      .relative.flex-1.hidden.w-0.lg_block
        img.absolute.inset-0.object-cover.w-full.h-full(src='https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixqx=ZpHulnDdtb&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80' alt='')

</template>
