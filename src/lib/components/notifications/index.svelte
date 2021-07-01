<script>
  // derived from Kev's 'Notification Toast Custom Store'
	// https://svelte.dev/repl/8c54d499f26e444c874f3e2933b7965c

	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { notifications } from './store.js';

	export let verticalPlacement = 'top'; // bottom, top, center
	export let horizontalPlacement = 'center'; // center, left, right, stretch

	let containerClasses = '';
	if (verticalPlacement === 'top') containerClasses += ' justify-start';
	if (verticalPlacement === 'center') containerClasses += ' justify-center';
	if (verticalPlacement === 'bottom') containerClasses += ' justify-end';
	if (horizontalPlacement === 'center') containerClasses += ' items-center px-16';
	if (horizontalPlacement === 'left') containerClasses += ' items-start pl-3 pr-16';
	if (horizontalPlacement === 'right') containerClasses += ' items-end pl-16 pr-3';
	if (horizontalPlacement === 'stretch') containerClasses += ' items-stretch px-16';

	let flyAnimationOffset;
	if (verticalPlacement === 'top') flyAnimationOffset = -32;
	if (verticalPlacement === 'bottom') flyAnimationOffset = 32;
</script>

<template lang="pug">
  div(class='{containerClasses}').fixed.inset-0.z-40.flex.flex-col.pt-3.pb-4.pointer-events-none
    +each('$notifications as notification (notification.id)')

      div(
        animate:flip='{{ duration: 300, easing: quintOut}}'
        transition:fly='{{ duration: 300, y: flyAnimationOffset, easing: quintOut }}'
        class='flex items-stretch rounded mb-2 text-white bg-gray-700 shadow-md pointer-events-auto {notification.type}'
        )

          // Icon
          +if("notification.type === 'info'")
            .icon.pl-4.self-center.text-blue-400
              // heroicons/information-circle
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
          +if("notification.type === 'success'")
            .icon.pl-4.self-center.text-green-500
              // heroicons/check-circle
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
          +if("notification.type === 'warning'")
            .icon.pl-4.self-center.text-yellow-400
              // heroicons/exclamation
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          +if("notification.type === 'danger'")
            .icon.pl-4.self-center.text-red-500
              // heroicons/x-circle
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>

          // Message
          div(class="py-1.5 {notification.type === 'default' ? 'pl-4' : 'pl-3'}").flex.flex-grow.space-x-3.pr-4
            span.font-medium {notification.message}
            +if('notification.detail')
              span.text-opacity-80 {notification.detail}

          // Close Link
          +if('notification.dismissable')
            button(on:click!="{() => notifications.dismiss(notification.id)}").text-gray-400.border-none.hover_text-white.px-4.active_bg-transparent.focus_bg-transparent.focus_outline-none
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>

</template>
