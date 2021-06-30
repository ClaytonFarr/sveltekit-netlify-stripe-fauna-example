<script>
	import { page, session } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as http from '$lib/utils/http-methods';
	import DropdownMenu from '$lib/components/DropdownMenu.svelte';

	// TODO: add logic to close Narrow Screen menu when 1) link selected, 2) click occurs outside menu
	let narrowScreenMenuOpen = false;
	export let businessName; // bringing this in as a prop since import call with env.VITE_BUSINESS_NAME breaks build in this context for an unknown reason

	const logoutHandler = () => {
		// update client state, redirect client, and attempt to revoke refresh tokens
		$session.user = {};
		goto('/welcome');
		http.post('/api/logoutUser');
	};

	const userMenuLabel = $session.user && $session.user.email ? $session.user.email : null;
	const userMenuItems = [
		{ label: 'Settings', action: '/account' },
		{ label: 'Sign Out', action: logoutHandler },
	];
</script>

<template lang="pug">

  nav.bg-white.shadow
    .max-w-7xl.mx-auto.px-2.sm_px-6.lg_px-8
      .relative.flex.justify-between.h-16
        .absolute.inset-y-0.left-0.flex.items-center.sm_hidden

          // Narrow Screen Menu Button
          button(
            type='button' 
            aria-controls='narrow-screen-menu' 
            aria-expanded='false'
            on:click!='{() => narrowScreenMenuOpen = !narrowScreenMenuOpen}'
          ).inline-flex.items-center.justify-center.p-2.rounded-md.text-gray-400.hover_text-gray-500.hover_bg-gray-100.focus_outline-none.focus_ring-2.focus_ring-inset.focus_ring-action-hover
            span.sr-only Open Menu

            // Icon (HeroIcons: outline/menu, outline/x)
            +if('!narrowScreenMenuOpen')
              svg(width='24px' height='24px' xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor' aria-hidden='true')
                path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 6h16M4 12h16M4 18h16')
              +else()
                svg(width='24px' height='24px' xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor' aria-hidden='true')
                  path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 18L18 6M6 6l12 12')

        .flex-1.flex.items-center.justify-center.sm_items-stretch.sm_justify-start

          .flex-shrink-0.flex.items-center
            a(href='.')
              img.block.h-8.w-auto.lg_hidden(src='/app-logo-mark.svg' alt='{businessName}' height='32')
              img.hidden.h-8.w-auto.lg_block(src='/app-logo.svg' alt='{businessName}' height='32')

          // Widescreen Primary Navigation
          #wide-screen-menu.hidden.sm_ml-6.sm_flex.sm_space-x-8

            a(href="/" aria-current="{$page.path === '/' ? 'page' : undefined}" sveltekit:prefetch) Dashboard
            a(href="/account" aria-current="{$page.path === '/account' ? 'page' : undefined}" sveltekit:prefetch) Account

        .absolute.inset-y-0.right-0.flex.items-center.pr-2.sm_static.sm_inset-auto.sm_ml-6.sm_pr-0

          // Notifications
          //- button.bg-white.p-1.rounded-full.text-gray-400.hover_text-gray-500.focus_outline-none.focus_ring-2.focus_ring-offset-2.focus_ring-action-hover
            span.sr-only View notifications

            // Heroicon name: outline/bell
            svg.h-6.w-6(xmlns='http://www.w3.org/2000/svg' fill='none' viewbox='0 0 24 24' stroke='currentColor' aria-hidden='true')
              path(stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9')

          // Account Menu
          .ml-3.relative.flex.space-x-3
            DropdownMenu(
              id='account-menu-button'
              menuItems='{userMenuItems}'
              menuLabel='{userMenuLabel}'
              hideLabelOnNarrow='{true}'
              )

    // Narrow Screen Primary Navigation (Menu)
    +if('narrowScreenMenuOpen')
      #narrow-screen-menu.sm_hidden
        .pt-2.pb-4.space-y-1

          // Inactive classes: "border-transparent text-gray-500 hover_bg-gray-50 hover_border-gray-300 hover_text-gray-700"
          // Active classes: "bg-action-highlight border-action text-action"
          a(href="/" aria-current="{$page.path === '/' ? 'page' : undefined}" sveltekit:prefetch) Dashboard
          a(href="/account" aria-current="{$page.path === '/account' ? 'page' : undefined}" sveltekit:prefetch) Account


</template>

<style>
	#wide-screen-menu a {
		@apply inline-flex items-center text-sm font-medium text-gray-500 px-1 pt-1 border-transparent border-b-2 hover_border-gray-300 hover_text-gray-700;
	}
	#wide-screen-menu a[aria-current] {
		@apply border-action-hover text-gray-900;
	}
	#narrow-screen-menu a {
		@apply block text-base font-medium text-gray-500 pl-3 pr-4 py-2 border-transparent border-l-4 hover_bg-gray-50 hover_border-gray-300 hover_text-gray-700;
	}
	#narrow-screen-menu a[aria-current] {
		@apply bg-action-highlight border-action text-action;
	}
</style>
