<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	const uid = Math.floor(Math.random() * 10000000);

	// Group Options
	// -------------------------------------------------------------------------------------------
	let thisGroup;
	export let groupLabel = null; // optional label header for input group
	export let options = [];
	// example content
	options = [
		{
			label: 'Radio One',
			checked: false,
			readonly: null,
			disabled: false,
			value: 'one',
			note: "I'm number one.",
		},
		{ label: 'Radio Two', value: 'two', note: 'I love number two.' },
		// option must include label OR value
		{ label: 'Radio Three' },
		{ value: 'four' },
	];
	export let group = []; // selected items
	export let name = `radiogroup-${uid}`;
	export let tabindex = null;
	export let autofocus = null; // boolean, **use thoughtfully** (https://tinyurl.com/inputautofocus)

	// Input Options
	// -------------------------------------------------------------------------------------------
	let thisInput;

	// Input Style Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let displayAsRow = true; // toggles horizontal or vertical display of options
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	// Label & Description Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	// optional label and note for each input are passed in through 'options' array
	export let labelHidden = false;
	export let labelWeightNormal = true; // toggles weight from default 'medium' to 'normal'
	export let optionLabelRight = true; // toggles which side of radioinput is displayed on
	export let showRequiredHint = true; // toggles display of asterisk next to label for required fields

	// Standard Validation Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	// optional 'required' validation passed in through 'options' array
	export let validateOnMount = false; // if true, will validate input and show any errors when component is mounted
	export let required = null;

	let touched = false;
	let errors = [];
	let warnings = [];

	// Handlers
	// -------------------------------------------------------------------------------------------
	function autoFocusFirstChildInput(node) {
		const input = node.querySelector('input');
		input.focus();
	}

	function checkValidity() {
		// clear & re-check for current errors or warnings
		errors = [];
		warnings = [];
		thisInput.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
	}

	onMount(() => {
		if (autofocus) autoFocusFirstChildInput(thisGroup);
		if (validateOnMount) checkValidity();
	});

	function inputHandler() {
		checkValidity();
	}

	function blurHandler(group, i) {
		const groupClasses = group.className;
		// run validation after user has interacted with last input
		if (groupClasses.includes('touched')) {			
			checkValidity();
		}
		if (!groupClasses.includes('touched') && i === options.length) {
			checkValidity();
			group.classList.add('touched');
		}
	}

	function invalidHandler() {
		// Standard Validation Messages (displayed as single error message for input group)
		if (thisInput.validity.valueMissing) errors = ['This choice is required.'];
	}
</script>

<div class={groupLabel ? 'space-y-4' : null} bind:this={thisGroup} {...$$restProps}>
	<div class="space-y-1">
		{#if groupLabel}
			<p class="font-medium">
				{groupLabel}
				{#if required && showRequiredHint}
					<abbr title="Required" class="font-normal text-gray-500">*</abbr>
				{/if}
		</p>
		{/if}
		{#if errors?.length || warnings?.length}
			<div class="error-block">
				<Errors {errors} {warnings} />
			</div>
		{/if}
	</div>
	<div class="flex {displayAsRow ? 'space-x-6' : 'flex-col space-y-4 items-start'}">
		{#each options as radio, i}
			<div class="optionInputBlock {containerClasses}" class:optionLabelRight>
				{#if radio.label}
					<label
						for="{name}-{i + 1}"
						id="{name}-{i + 1}-label"
						class:hide={labelHidden}
						class="block text-gray-700 {labelWeightNormal ? 'font-normal' : 'font-medium'}"
					>
						{radio.label}
					</label>
				{/if}
				<input
					bind:this={thisInput}
					type="radio"
					{name}
					id="{name}-{i + 1}"
					{tabindex}
					value={radio.value ? radio.value : radio.label ? radio.label : null}
					bind:group
					checked={radio.checked ? radio.checked : null}
					disabled={radio.disabled ? radio.disabled : null}
					readonly={radio.readonly ? radio.readonly : null}
					{required}
					class:inheritFontSize
					class:addBg={bgFill}
					class:addBorder={border}
					class:addShadow={shadow && border}
					class:hasWarning={warnings.length !== 0}
					class:hasError={errors.length !== 0}
					class="{inputClasses} {!radio.label ? 'mt-1' : null}"
					aria-required={radio.required ? radio.required : null}
					aria-disabled={radio.disabled ? radio.disabled : null}
					aria-labelledby={radio.label ? `${name}-${i + 1}-label` : null}
					aria-describedby={radio.note ? `${name}-${i + 1}-description` : null}
					aria-invalid={errors.length !== 0 ? true : null}
					on:input={inputHandler}
					on:blur={blurHandler(thisGroup, i+1)}
					on:invalid={invalidHandler}
				/>
				<!-- using 'add' class names (e.g. 'addShadow') to avoid collisions with Tailwind class names -->
				{#if radio.note}
					<p id="{name}-{i + 1}-description" class="description-block">{radio.note}</p>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.hide {
		@apply sr-only;
	}

	input {
		@apply w-4 h-4 border border-transparent text-action focus_ring-action-hover;
	}
	input.addBg:not(.addBorder):not(:checked) {
		@apply bg-gray-200;
	}
	input.addBg.addBorder:not(:checked) {
		@apply bg-gray-100;
	}
	input.leftPadding {
		@apply px-3;
	}
	input:not(.inheritFontSize) {
		@apply text-sm;
	}
	input.addBorder {
		@apply border-gray-300;
	}
	input:not([readonly], [disabled]) {
		@apply focus_ring-action-hover focus_border-action-hover;
	}
	input[readonly] {
		@apply bg-transparent focus_ring-transparent focus_border-transparent cursor-default pointer-events-none;
	}
	input.addShadow:not([readonly], [disabled]) {
		@apply shadow-sm;
	}

	/* Can enable input styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	input.hasWarning:not([disabled]) {
		@apply focus_ring-yellow-500 focus_border-yellow-500;
	}
	input.addBorder.hasWarning:not([disabled]) {
		@apply border-yellow-500;
	} */

	input.hasError:not([disabled]) {
		@apply focus_ring-red-500 focus_border-red-500;
	}
	input.addBorder.hasError:not([disabled]) {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	input:required {}
	input:optional {}
	input:user-invalid {}
	 */

	input[disabled],
	input[readonly] {
		@apply opacity-60;
	}
	input.addBorder[disabled] {
		@apply border-opacity-40;
	}
	input.addShadow[disabled] {
		@apply shadow-none;
	}

	.optionInputBlock {
		@apply inline-grid gap-x-3 gap-y-1;
		grid-template-columns: auto auto;
		align-content: baseline;
	}
	input {
		align-self: center;
	}
	.error-block {
		grid-column-start: 1;
	}
	.optionLabelRight label {
		grid-column-start: 2;
	}
	.optionLabelRight input {
		grid-column-start: 1;
		grid-row-start: 1;
	}
	.optionLabelRight .description-block {
		grid-column-start: 2;
	}
	.optionLabelRight .error-block {
		grid-column-start: 2;
	}

	.description-block {
		@apply text-xs text-gray-500;
	}
</style>
