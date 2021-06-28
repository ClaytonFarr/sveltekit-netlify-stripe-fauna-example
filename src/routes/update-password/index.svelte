<script>
	import { browser } from '$app/env';
	import * as http from '$lib/utils/http';
	import { Form, InputPassword } from '$lib/components/forms';

	const businessName = import.meta.env.VITE_BUSINESS_NAME;
	let windowWidth = null;
	const tailwindLgBreakpoint = 1024;

	// VERIFY TOKEN
	// if valid, passwordRecoveryVerify will set a valid JWT httpOnly cookie
	let recoveryTokenValid = null;
	const checkRecoveryToken = async (token) => {
		try {
			let data = await http.post('/api/passwordRecoveryVerify', { token });
			if (!data.ok) throw {};
			// if successful, display password reset UI
			recoveryTokenValid = true;
		} catch (err) {
			// if unsuccessful, display error UI
			recoveryTokenValid = false;
		}
	};
	// check for recovery token on page load
	const tokenName = `#recovery_token`;
	if (browser && location.hash && location.hash.startsWith(tokenName)) {
		const token = location.hash.slice(tokenName.length + 1);
		checkRecoveryToken(token);
	}
	if (browser && (!location.hash || !location.hash.startsWith(tokenName))) {
		recoveryTokenValid = false;
	}

	// PASSWORD RESET
	let password = null;
	let passwordConfirmation = null;
	let error = null;
	let passwordResetSuccess = false;
	// make request to update password with JWT cookie
	const updatePasswordHandler = async () => {
		error = null; // reset any error messages
		try {
			let data = await http.post('/api/updatePassword', { password });
			if (!data.ok || data.body.error) throw { message: data.body.error };
			// if successful, display success UI
			passwordResetSuccess = true;
		} catch (err) {
			// if unsuccessful display error message
			error = err.message;
		}
	};
</script>

<svelte:head>
	<title>Reset Password</title>
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

<template lang="pug">

  .flex.min-h-screen.bg-white
    .flex.flex-col.justify-center.flex-1.px-4.py-12.sm_px-6.lg_flex-none.lg_px-20.xl_px-24
      div(class="md_h-3/4").w-full.max-w-sm.mx-auto.lg_w-96

        img.w-auto.h-12(src='/app-logo-mark.svg' alt='{businessName}' height='48')

        h2.mt-6.text-3xl.font-extrabold.text-gray-900 Reset Password

        +if('recoveryTokenValid === null')
          p.mt-3.text-gray-600.max-w Verifying password reset token…

        +if('recoveryTokenValid === false')
          .text-gray-600.max-w
            p.mt-3 Invalid token &ndash; please request a #[a(href='/welcome?reset').font-medium.text-action.hover_text-action-hover.cursor-pointer new password reset].

        +if('recoveryTokenValid === true')

          Form(
            fullWidthActions='{true}'
            submitLabel='Reset Password'
            processingLabel='Sending…'
            submitHandler='{updatePasswordHandler}'
            tertiaryAction='{true}'
            tertiaryActionLabel='Return to Sign In'
            tertiaryActionLink='/welcome'
            formLevelErrors='{error}'
            )

            svelte:fragment(slot='preface')
              +if('passwordResetSuccess === false')
                p.mt-3.text-gray-600.max-w Enter new password.
              +if('passwordResetSuccess === true')
                p.mt-3.text-gray-600.max-w Password reset succesfully.
                p.mt-2 #[a(href='/welcome').font-medium.text-action.hover_text-action-hover.cursor-pointer &larr; Return to Sign In]

            +if('passwordResetSuccess === false')
              InputPassword(
                label="Password" 
                name='password' 
                bind:value='{password}' 
                autocomplete='new-password' 
                newPassword='{true}'
                required
                showRequiredHint='{false}'
                )
              InputPassword(
                label='Password Confirmation' 
                name='passwordConfirmation' 
                bind:value='{passwordConfirmation}' 
                autocomplete='new-password' 
                required 
                showRequiredHint='{false}'
                pattern='{password}'
                patternMessage='New passwords do not match.'
                validateOnInput='{false}'
                )

    // Photo
    +if('windowWidth > tailwindLgBreakpoint - 1')
      .relative.flex-1.hidden.w-0.lg_block
        img.absolute.inset-0.object-cover.w-full.h-full(src='https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixqx=ZpHulnDdtb&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80' alt='')

</template>
