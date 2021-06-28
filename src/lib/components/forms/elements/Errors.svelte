<script>
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let errors = [];
	export let warnings = [];
	export let formError = false;

	$: errorMessage = errors ? errors[0] : undefined;
	$: warningMessage = warnings ? warnings[0] : undefined;
	$: currentMessage = errorMessage ? errorMessage : warningMessage ? warningMessage : undefined;
</script>

{#if currentMessage}
	<p
		transition:fade={{ duration: 300, easing: quintOut }}
		class:block={formError}
		class:error={errorMessage}
		class:warning={warningMessage && !errorMessage}
		{...$$restProps}
	>
		{currentMessage}
	</p>
{/if}

<style>
	.warning {
		@apply text-xs text-yellow-600;
	}
	.warning.block {
		@apply text-sm text-center py-3 px-4 my-8 rounded-sm bg-yellow-50;
	}
	.error {
		@apply text-xs text-red-700;
	}
	.error.block {
		@apply text-sm text-center py-3 px-4 my-8 rounded-sm bg-red-50;
	}
</style>
