<script>
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';

	export let id = null;
	export let useMenuLabel = true;
	export let menuLabel = 'Menu';
	export let hideLabelOnNarrow = false;
	export let useMenuAvatar = true;
	export let avatarGradient = true;
	export let avatarUser = null;
	// expected avatarUser object format
	// {
	// 	name: 'Clayton Farr',
	// 	imageUrl:
	// 		'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixqx=ZpHulnDdtb&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=64&h=64&q=80'
	// };
	export let menuItems = [
		{ label: 'Link One', action: '/' },
		{ label: 'Link Two', action: '/' },
		{ label: 'Link Three', action: '/' },
	];

	const menuLabelClasses = hideLabelOnNarrow ? 'hidden sm_inline-block' : '';

	let show = false; // menu state
	let menu = null; // menu wrapper DOM reference

	const menuItemClickHandler = () => (show = false);

	onMount(() => {
		const outsideMenuClickHandler = (event) => {
			if (show && !menu.contains(event.target)) show = false;
		};
		const escapeMenuHandler = (event) => {
			if (show && event.key === 'Escape') show = false;
		};

		// add listeners when element is added to the DOM
		document.addEventListener('click', outsideMenuClickHandler, false);
		document.addEventListener('keyup', escapeMenuHandler, false);

		// remove listeners when element is removed from the DOM
		return () => {
			document.removeEventListener('click', outsideMenuClickHandler, false);
			document.removeEventListener('keyup', escapeMenuHandler, false);
		};
	});
</script>

<template lang="pug">

  div(id='{id}' bind:this='{menu}').relative
    button(
      type='button'
      aria-expanded='false'
      aria-haspopup='true'
      on:click!='{() => (show = !show)}'
      ).font-medium.text-gray-500.hover_text-gray-900.focus_outline-none.focus_shadow-solid.flex.items-center.space-x-3
      +if('useMenuLabel && menuLabel !== null')
        span(class='{menuLabelClasses}') {menuLabel}
      +if('useMenuAvatar')
        .relative.flex.w-8.h-8
          +if('avatarUser && avatarUser.imageUrl')
            img(
              src='{avatarUser.imageUrl}'
              alt='{avatarUser.name}'
              ).w-full.h-full.rounded-full
            +else()
              +if('avatarUser && avatarUser.name')
                span.absolute.top-0.left-0.h-full.w-full.flex.items-center.justify-center.text-base
                  span.text-white.font-semibold {avatarUser.name.charAt(0).toUpperCase()}
              +if('avatarGradient')
                span.h-full.w-full.rounded-full.bg-gradient-to-tr.from-brand-dark.to-brand-light
                +else()
                  span.h-full.w-full.rounded-full.bg-brand

    +if('show')
      div(
        in:scale='{{ duration: 100, start: 0.95 }}'
        out:scale='{{ duration: 75, start: 0.95 }}'
        ).origin-top-right.absolute.right-0.border.border-gray-100.py-2.mt-1.bg-white.rounded.shadow-md
        +each('menuItems as item')
          span(on:click='{menuItemClickHandler}').block.w-48.text-gray-700.hover_text-gray-700
            +if("typeof item.action === 'string'")
              a(
								href='{item.action}'
								aria-current="{$page.path === item.action ? 'page' : undefined}"
								sveltekit:prefetch
								).block.pl-4.pr-8.py-2.hover_bg-action-highlight {item.label}
              +else()
                span(
									on:click='{item.action()}'
									).block.pl-4.pr-8.py-2.hover_bg-action-highlight.cursor-pointer {item.label}

</template>

<style>
	a[aria-current] {
		@apply bg-gray-50 cursor-default;
	}
</style>
