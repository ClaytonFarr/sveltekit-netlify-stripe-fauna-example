<script context="module">
	export async function load({ page }) {
		// redirect non-deleting visitors
		// expects simple '?success' flag in url
		if (!page.query.has('success')) {
			return {
				status: 302,
				redirect: '/'
			};
		}
		// else return requested view
		return true;
	}
</script>

<script>
	const businessName = import.meta.env.VITE_BUSINESS_NAME;
	const marketingDomain = import.meta.env.VITE_BUSINESS_DOMAIN;
	const helpEmailAddress = import.meta.env.VITE_BUSINESS_HELP_EMAIL;
	let windowWidth = null;
	const tailwindLgBreakpoint = 1024;
</script>

<svelte:head>
	<title>Thank You &middot; {import.meta.env.VITE_BUSINESS_NAME}</title>
</svelte:head>

<svelte:window bind:innerWidth={windowWidth} />

<template lang="pug">

  .flex.min-h-screen.bg-white
    .flex.flex-col.justify-center.flex-1.px-4.py-12.sm_px-6.lg_flex-none.lg_px-20.xl_px-24
      div(class="md_h-3/4").w-full.max-w-sm.mx-auto.lg_w-96
        div
          img.w-auto.h-12(src='/app-logo-mark.svg' alt='{businessName}' height='48')
          h2.mt-6.text-3xl.font-extrabold.text-gray-900 Thank you
          p.mt-6.text-gray-600.max-w Your account and data have been successully deleted.
          p.mt-3.text-gray-600.max-w 
            | Thank you for being a #[b.font-semibold {businessName}] customer. 
            | If we can be of any help now or in the future please #[a(href='{`mailto:${helpEmailAddress}`}').cursor-pointer.text-action.underline let us know].
          p.mt-6 #[a(href='{`https://www.${marketingDomain}`}').font-medium.text-action.hover_text-action-hover.cursor-pointer &larr; Return to Site]

    // Photo
    +if('windowWidth > tailwindLgBreakpoint - 1')
      .relative.flex-1.hidden.w-0.lg_block
        img.absolute.inset-0.object-cover.w-full.h-full(src='https://images.unsplash.com/photo-1505904267569-f02eaeb45a4c?ixlib=rb-1.2.1&ixqx=ZpHulnDdtb&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1908&q=80' alt='')

</template>
