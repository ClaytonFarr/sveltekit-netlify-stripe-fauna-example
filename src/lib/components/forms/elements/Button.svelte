<script>
	export let label = 'Click';
	export let type = 'button'; // button, submit, reset
	export let level = 'primary'; // primary, secondary, tertiary
	export let size = 'standard'; // featured, standard, inline
	export let naturalWidth = false;
	export let disabled = false;
	export let danger = false;
	export let buttonClasses = '';
	export let hoverable = true;
	export let tabindex = null;
</script>

<button
	{type}
	{disabled}
	{tabindex}
	class="{size} {level} {buttonClasses}"
	class:fullwidth={!naturalWidth}
	class:hoverable
	class:danger
	{...$$restProps}
	on:click
>
	<slot>
		{label}
	</slot>
</button>

<style>
	button {
		@apply flex justify-center font-medium border transition-colors;
	}

	button.inline {
		@apply text-sm py-2 px-3 rounded;
	}
	button.standard {
		@apply text-sm py-3 px-5 rounded-md;
	}
	button.featured {
		@apply text-base py-3 px-6 rounded-md;
	}

	button.hoverable {
		@apply focus_outline-none focus_ring-2 focus_ring-offset-2;
	}
	button.hoverable:not(.danger) {
		@apply focus_bg-action-focus focus_ring-action-focus;
	}
	button.hoverable.danger {
		@apply focus_bg-red-700 focus_ring-red-700;
	}

	button.primary:not(.danger) {
		@apply text-white shadow-sm bg-action border-transparent;
	}
	button.primary.hoverable:not(.danger) {
		@apply hover_bg-action-hover;
	}
	button.primary.danger {
		@apply text-white shadow-sm bg-red-600 border-transparent;
	}
	button.primary.danger.hoverable {
		@apply hover_bg-red-700;
	}

	button.secondary:not(.danger) {
		@apply text-action border-action;
	}
	button.secondary.hoverable:not(.danger) {
		@apply hover_text-white hover_bg-action-hover hover_border-action-hover focus_border-action-focus focus_text-white;
	}
	button.secondary.danger {
		@apply text-red-600 border-red-600;
	}
	button.secondary.danger.hoverable {
		@apply hover_text-white hover_bg-red-700 hover_border-red-700 focus_border-red-700 focus_text-white;
	}

	button.tertiary:not(.danger) {
		@apply text-action border-transparent;
	}
	button.tertiary.hoverable:not(.danger) {
		@apply hover_text-white hover_bg-action-hover focus_text-white;
	}
	button.tertiary.danger {
		@apply text-red-600 border-transparent;
	}
	button.tertiary.danger.hoverable {
		@apply hover_text-white hover_bg-red-700 focus_text-white;
	}

	button.fullwidth:not(.inline) {
		@apply w-full;
	}

	button:disabled {
		opacity: 0.5;
		cursor: default;
		pointer-events: none;
	}
</style>
